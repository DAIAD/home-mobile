//
//  aes.h
//  DAIAD
//
//  Created by Nikolas Georgomanolis on 04/07/2017.
//


#import <Foundation/Foundation.h>

@interface NSData (AES256Encryption)
- (NSData *)originalDataWithHexKey:(NSString*)hexKey hexIV:(NSString *)hexIV;
@end
