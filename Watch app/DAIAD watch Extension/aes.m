//
//  aes.m
//  DAIAD watch Extension
//
//  Created by Nikolas Georgomanolis on 04/07/2017.
//

#import <Foundation/Foundation.h>
#import "aes.h"
#import <CommonCrypto/CommonDigest.h>
#import <CommonCrypto/CommonCryptor.h>

@interface NSData (AES256Encryption)
- (NSData *)originalDataWithHexKey:(NSString*)hexKey hexIV:(NSString *)hexIV;
@end

@implementation NSData (AES256Encryption)

+ (NSData *)dataFromHexString:(NSString *)string
{
    string = string.lowercaseString;
    NSMutableData *data = [[NSMutableData alloc] initWithCapacity:string.length/2];
    unsigned char whole_byte;
    char byte_chars[3] = {'\0','\0','\0'};
    int i = 0;
    NSUInteger length = string.length;
    while (i < length-1) {
        char c = [string characterAtIndex:i++];
        if (c < '0' || (c > '9' && c < 'a') || c > 'f')
            continue;
        byte_chars[0] = c;
        byte_chars[1] = [string characterAtIndex:i++];
        whole_byte = strtol(byte_chars, NULL, 16);
        [data appendBytes:&whole_byte length:1];
    }
    return data;
}

+ (void)fillDataArray:(char **)dataPtr length:(NSUInteger)length usingHexString:(NSString *)hexString
{
    NSData *data = [NSData dataFromHexString:hexString];
    //NSAssert((data.length + 1) == length, @"The hex provided didn't decode to match length");
    
    *dataPtr = malloc(length * sizeof(char));
    bzero(*dataPtr, sizeof(*dataPtr));
    memcpy(*dataPtr, data.bytes, data.length);
}
- (NSData *)originalDataWithHexKey:(NSString*)hexKey hexIV:(NSString *)hexIV
{
    // Fetch key data and put into C string array padded with \0
    char *keyPtr;
    [NSData fillDataArray:&keyPtr length:kCCKeySizeAES128+1 usingHexString:hexKey];
    
    // For block ciphers, the output size will always be less than or equal to the input size plus the size of one block because we add padding.
    // That's why we need to add the size of one block here
    NSUInteger dataLength = self.length;
    size_t bufferSize = dataLength + kCCBlockSizeAES128;
    void *buffer = malloc( bufferSize );
    
    size_t numBytesDecrypted = 0;
    CCCryptorStatus cryptStatus = CCCrypt( kCCDecrypt,
                                          kCCAlgorithmAES128,
                                          kCCOptionECBMode,
                                          keyPtr,
                                          kCCKeySizeAES128,
                                          0,
                                          [self bytes],
                                          dataLength, /* input */
                                          buffer,
                                          bufferSize, /* output */
                                          &numBytesDecrypted );
    free(keyPtr);
    //free(ivPtr);
    
    if( cryptStatus == kCCSuccess )
    {
        
        //NSLog(@"Decrypted Result: %@", [NSData dataWithBytesNoCopy:buffer length:numBytesDecrypted]);
        
        // The returned NSData takes ownership of the buffer and will free it on deallocation
        return [NSData dataWithBytesNoCopy:buffer length:numBytesDecrypted];
    }
    
    free(buffer);
    return nil;
}
@end
