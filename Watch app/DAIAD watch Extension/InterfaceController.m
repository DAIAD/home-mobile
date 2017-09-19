//
//  InterfaceController.m
//  DAIAD watch Extension
//
//  Created by Nikolas Georgomanolis on 03/07/2017.
//

#import <UIKit/UIKit.h>
#import "InterfaceController.h"
#import "aes.h"
#import "tableRow.h"
@import CoreBluetooth;
@import WatchConnectivity;

CBCentralManager * myCentralManager;

NSString *key;
NSString *volstr ;
NSString *volume_label;
NSString *temstr;
NSString *cold_value;
NSString *enestr;
NSString *energy_label;
NSString *fmr;
NSString * scale;
NSString *usernameCredential;
NSString *passCredential;
BOOL enabled;
UIFont *labelfont;
NSArray *_pickerData,*_pckdata;
NSArray *_pickerVolumeData;
NSAttributedString *labelText;
int countHaptics = 0;
int timerDuration;
int tmdur = 0;
int volumeTimerPicker;
int vldur = 1;
int countMinutes;

static int numberofrows = 0;

@implementation InterfaceController

// CBCentralManagerDelegate - This is called with the CBPeripheral class as its main input parameter. This contains most of the information there is to know about a BLE peripheral.
- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI
{
  
    NSData *data = [advertisementData objectForKey:CBAdvertisementDataManufacturerDataKey];
    
    if (data != nil) {
        [self AES128Test:data];
    }
        
}

- (void)AES128Test : (NSData *) data  {
    
    
    NSLog(@"AESKEY : @%@",key);
    
    if( !key ) {
        return;
    }
    //code : KAUQ1861
    //NSString *key = @"6a5d3209c6826d40efbaef8f724c269a";
    //NSLog(@"data: %@", data);
    //000NSString *base64Temp = [data base64EncodedStringWithOptions:0];
    //NSLog(@"data base64: %@", base64Temp);
    NSData *firsttwo = [data subdataWithRange:NSMakeRange(0, 2)];
    //NSLog(@"firsttwo data : %@", firsttwo);
    NSData *d1 = [data subdataWithRange:NSMakeRange(2, 16)];
    //NSLog(@"sub data : %@", d1);
    NSString *base64Temp2 = [d1 base64EncodedStringWithOptions:0];
    
    NSData *data4 = [[NSData alloc] initWithBase64EncodedString:base64Temp2 options:0];
    
    NSData *decryptedPayload = [data4 originalDataWithHexKey:key hexIV:nil];
    
    if (decryptedPayload) {
        //NSLog(@"Decrypted Result: %@", decryptedPayload);
        NSMutableData *completeData = [firsttwo mutableCopy];
        NSData *first14 = [decryptedPayload subdataWithRange:NSMakeRange(0, 14)];
        [completeData appendData:first14];
        //NSLog(@"Completed for Round 2: %@", completeData);
        NSData *complete = [NSData dataWithData:completeData];
        //NSLog(@"Completed go..: %@", complete);
        //NSLog(@"Completed length..: %lu", (unsigned long)[complete length]);
        NSData *decryptedPayload1 = [complete originalDataWithHexKey:key hexIV:nil];
        
        if (decryptedPayload1) {
            //NSLog(@"Final Result Bytes: %@", decryptedPayload1);
            const uint8_t *bt = (const uint8_t*)[decryptedPayload1 bytes];
            
            NSUInteger length = [decryptedPayload1 length];
            NSUInteger index;
            NSInteger myIntegers[20];
            
            for (index = 0; index<length; index++)
                myIntegers[index] = bt[index];
            
            if(myIntegers[0] == 17) {
                [self processRealPacket:myIntegers];
                [self playHaptic:myIntegers];
            } else if(myIntegers[0] == 18) {
                [self processHistoryPacket:myIntegers];
            }
                        
        }
        
    }
    
}

-(void) processRealPacket : (NSInteger*)myIntegers
{
    
    NSUInteger temp =  myIntegers[13];
    double vol = 1.0*(256*myIntegers[5]+256*myIntegers[6]+256*myIntegers[7]+myIntegers[8])/10;
    float energy =  256*myIntegers[9]+256*myIntegers[10]+256*myIntegers[11]+myIntegers[12];
    double duration = 1.0 * ((vol / 20) * 60);
    
    NSUInteger m = ((int)duration / 60) % 60;
    NSUInteger s = (int)duration % 60;
    NSString *formattedTime = [NSString stringWithFormat:@"%02u:%02u", m, s];
    
    if(energy > 1000) {
        energy_label = @"kWh";
        enestr = [NSString stringWithFormat:@"%.1f", energy /1000];
    } else {
        energy_label = @"w";
        enestr = [NSString stringWithFormat:@"%d", (int)energy];
    }
    
    if( vol < 10 ) {
        fmr = @"%.1f";
    } else if( vol >= 100 ){
        fmr = @"%.0f";
    }
    
    volume_label = @"lt";
    volstr = [NSString stringWithFormat:@"%.1f",vol];
    temstr = [NSString stringWithFormat:@"%d", temp];
    
    [_volume setAttributedText:[[NSAttributedString alloc] initWithString : volstr attributes : @{ NSFontAttributeName : labelfont}]];
    [_volumeLabel setText:volume_label];
    [_temperature setText:temstr];
    [_tempLabel setText:@"\u00B0C"];
    [_energy setText:enestr];
    [_energyLabel setText:energy_label];
    [_efficiency setText:[self efficiency:(int)energy]];
    [_image setImageNamed:[self computeImage:(int)duration]];
    [_durationValue setText:[NSString stringWithFormat:@"%@", formattedTime]];
    
}

-(void) processHistoryPacket : (NSInteger*)myIntegers
{
    
    NSUInteger vol_history =  (256*myIntegers[7]+myIntegers[8])/10;
    NSUInteger temp_history = myIntegers[9];
    NSUInteger cold = myIntegers[10];
    float energy_history = (vol_history*(temp_history-cold)*4.182)/3.6;
    
    if(energy_history > 1000) {
        energy_history = energy_history /1000;
        enestr = [NSString stringWithFormat:@"%.1f %@", energy_history,@"kWh"];
    } else {
        enestr = [NSString stringWithFormat:@"%d %@", (int)energy_history , @"watt"];
    }
    
    temstr = [NSString stringWithFormat:@"%d \u00B0C", temp_history];
    
    [self setTableRow:[NSString stringWithFormat:@"%d %s",vol_history,"lt"] :temstr :enestr];
    
}

-(void)playHaptic : (NSInteger*) myIntegers{
    
    int vol = (256*myIntegers[5]+256*myIntegers[6]+256*myIntegers[7]+myIntegers[8])/10;
    
    double duration = 1.0 * ((vol / 20) * 60);
    
    NSLog(@"volume - time : @%d %d",vldur , tmdur);
    
    if( vldur == 1) {
         NSLog(@"volumes xxxx  : @%d %d",vol,  volumeTimerPicker);
        if( vol >= volumeTimerPicker && volumeTimerPicker > 0) {
             NSLog(@"volumepicker");
            if( (vol % countHaptics) == 0) {
                [[WKInterfaceDevice currentDevice] playHaptic:WKHapticTypeNotification];
            }
            
            if ( countHaptics > 20 || countHaptics > vol) {
                countHaptics = 0;
            }
            
            countHaptics++;
            
        }
        
    } else if( tmdur == 1) {
        NSLog(@"times xxxx  : @%d %d",(int)duration,  timerDuration);
        if( duration > timerDuration && timerDuration >0) {
            NSLog(@"timepicker");
            if( (vol % countHaptics) == 0) {
                [[WKInterfaceDevice currentDevice] playHaptic:WKHapticTypeNotification];
            }
            
            if ( countHaptics > 20 || countHaptics > vol) {
                countHaptics = 0;
            }
            
            countHaptics++;
            
        }
        
    }
    
    //[[WKInterfaceDevice currentDevice] playHaptic:WKHapticTypeNotification]; // notification + vibration
    //[[WKInterfaceDevice currentDevice] playHaptic:WKHapticTypeDirectionUp]; //  beep
}

-(NSString*) efficiency : (int)e
{
    
    if(e < 700) {
        scale = @"A";
    } else if(e >= 700 && e< 1225) {
        scale = @"B";
    } else if(e >= 1225 &&  e< 1750) {
        scale = @"C";
    } else if(e >= 1750 &&  e< 2275) {
        scale = @"D";
    } else if(e >= 2275 &&  e< 2800) {
        scale = @"E";
    } else {
        scale = @"F";
    }
    
    return scale;
    
}

- (NSString*)computeImage : (int)y
{
    if(timerDuration) {
        countMinutes = (1.0 * y / ((timerDuration/60) * 60)) * 100 ;
    } else {
        countMinutes = (1.0 * y / 300) * 100;
    }
    
    if(countMinutes > 100) {
        countMinutes = (1.0 * 300 / 300) * 100;
    }
    
    return [NSString stringWithFormat:@"steps-%f.png", (double)countMinutes];
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central
{
    // Determine the state of the peripheral
    if ([central state] == CBManagerStatePoweredOff) {
        NSLog(@"CoreBluetooth BLE hardware is powered off");
    }
    else if ([central state] == CBManagerStatePoweredOn) {
        NSLog(@"CoreBluetooth BLE hardware is powered on and ready");
        //[myCentralManager scanForPeripheralsWithServices:nil options:nil];
    }
    else if ([central state] == CBManagerStateUnauthorized) {
        NSLog(@"CoreBluetooth BLE state is unauthorized");
    }
    else if ([central state] == CBManagerStateUnknown) {
        NSLog(@"CoreBluetooth BLE state is unknown");
    }
    else if ([central state] == CBManagerStateUnsupported) {
        NSLog(@"CoreBluetooth BLE hardware is unsupported on this platform");
    }
}

- (void)awakeWithContext:(id)context {
    [super awakeWithContext:context];
    
    myCentralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:nil];
    
    [self.table setNumberOfRows:5 withRowType:@"tableRow"];
    
    labelfont = [UIFont systemFontOfSize:30];
    
    labelText = [[NSAttributedString alloc] initWithString : @"0.0" attributes : @{ NSFontAttributeName : labelfont}];
    
    volstr = [NSString stringWithFormat:@"%s","0.0"];
    
    [self setPickerData];
    
}

-(void) createUsernameInput
{
    [self presentTextInputControllerWithSuggestions:@[@""] allowedInputMode:WKTextInputModePlain completion:^(NSArray *array1){
        if (array1 != nil) {
            for (int i=0; i<[array1 count]; i++) {
                NSString *str = [array1 objectAtIndex:0];
                NSLog(@"%@",str);
                usernameCredential = str;
            }
            
            [_btnUsername setHidden:YES];
            [_btnPass setHidden:NO];
        } else {
            [_btnUsername setHidden:NO];
            [_btnPass setHidden:YES];
        }
        
    }];
}

-(void) createPasswordInput
{
    [self presentTextInputControllerWithSuggestions:@[@""] allowedInputMode:WKTextInputModePlain completion:^(NSArray *array1){
        if (array1 != nil) {
            for (int i=0; i<[array1 count]; i++) {
                NSString *str2 = [array1 objectAtIndex:0];
                NSLog(@"%@",str2);
                passCredential = str2;
            }
            
            [_btnPass setHidden:YES];
            [_btnUsername setHidden:YES];
            [_pleaseWait setHidden:NO];
            [self setPostRequest:usernameCredential :passCredential];
        } else {
            [_btnUsername setHidden:YES];
            [_pleaseWait setHidden:YES];
        }
        
        
        
    }];
}

-(void) setPostRequest : (NSString*)username : (NSString*)password
{
    
    NSURL *url = [NSURL URLWithString:@"https://app.dev.daiad.eu/api/v1/profile/load"];
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
    NSDictionary *dictionary = @{@"username": username,@"password":password};
    NSError *error1 = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:dictionary options:kNilOptions error:&error1];
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
    request.HTTPMethod = @"POST";
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    if (!error1) {
        NSURLSessionUploadTask *uploadTask = [session uploadTaskWithRequest:request
                                                                   fromData:data completionHandler:^(NSData *data1,NSURLResponse *response,NSError *error) {
                                                                       // Handle response here
                                                                       NSDictionary *jsonArray = [NSJSONSerialization JSONObjectWithData:data1 options:kNilOptions error:&error];
                                                                       NSLog(@"JSON ARRAY: %@",jsonArray);
                                                                       
                                                                        NSArray *items = [jsonArray valueForKeyPath:@"profile.devices"];
                                                                       
                                                                       if (error != nil || !items) {
                                                                           NSLog(@"Error parsing JSON.");
                                                                           [_pleaseWait setHidden:YES];
                                                                           [_btnPass setHidden:YES];
                                                                           [_btnUsername setHidden:NO];
                                                                           
                                                                       } else {
                                                                           
                                                                           NSLog(@"Array: %@",items);
                                                                           
                                                                           NSPredicate *predicate = [NSPredicate predicateWithFormat:@"type == %@", @"AMPHIRO"];
                                                                           NSArray *filteredArray = [items filteredArrayUsingPredicate:predicate];
                                                                           key =  [[filteredArray valueForKeyPath:@"aesKey"] componentsJoinedByString:@""];
                                                                           
                                                                           [_pleaseWait setHidden:YES];
                                                                           [_pickerGroup setHidden:YES];
                                                                           [_groupMain setHidden:NO];
                                                                           [myCentralManager scanForPeripheralsWithServices:nil options:nil];
                                                                           
                                                                           
                                                                       }
                                                                       
                                                                   }];
        [uploadTask resume];
    }
    
}

-(void)setPickerData
{
    // Initialize Data    
    WKPickerItem *pickerItem1 = [WKPickerItem alloc];
    [pickerItem1 setTitle:@"1 min"];
    WKPickerItem *pickerItem2 = [WKPickerItem alloc];
    [pickerItem2 setTitle:@"2 min"];
    WKPickerItem *pickerItem3 = [WKPickerItem alloc];
    [pickerItem3 setTitle:@"3 min"];
    WKPickerItem *pickerItem4 = [WKPickerItem alloc];
    [pickerItem4 setTitle:@"4 min"];
    WKPickerItem *pickerItem5 = [WKPickerItem alloc];
    [pickerItem5 setTitle:@"5 min"];
    WKPickerItem *pickerItem6 = [WKPickerItem alloc];
    [pickerItem6 setTitle:@"6 min"];
    WKPickerItem *pickerItem7 = [WKPickerItem alloc];
    [pickerItem7 setTitle:@"7 min"];
    WKPickerItem *pickerItem8 = [WKPickerItem alloc];
    [pickerItem8 setTitle:@"8 min"];
    WKPickerItem *pickerItem9 = [WKPickerItem alloc];
    [pickerItem9 setTitle:@"9 min"];
    
    WKPickerItem *pickerItem10 = [WKPickerItem alloc];
    [pickerItem10 setTitle:@"5 lt"];
    WKPickerItem *pickerItem11 = [WKPickerItem alloc];
    [pickerItem11 setTitle:@"8 lt"];
    WKPickerItem *pickerItem12 = [WKPickerItem alloc];
    [pickerItem12 setTitle:@"10 lt"];
    WKPickerItem *pickerItem13 = [WKPickerItem alloc];
    [pickerItem13 setTitle:@"12 lt"];
    WKPickerItem *pickerItem14 = [WKPickerItem alloc];
    [pickerItem14 setTitle:@"16 lt"];
    WKPickerItem *pickerItem15 = [WKPickerItem alloc];
    [pickerItem15 setTitle:@"20 lt"];
    WKPickerItem *pickerItem16 = [WKPickerItem alloc];
    [pickerItem16 setTitle:@"25 lt"];
    WKPickerItem *pickerItem17 = [WKPickerItem alloc];
    [pickerItem17 setTitle:@"30 lt"];
    WKPickerItem *pickerItem18 = [WKPickerItem alloc];
    [pickerItem18 setTitle:@"35 lt"];
    WKPickerItem *pickerItem19 = [WKPickerItem alloc];
    [pickerItem19 setTitle:@"40 lt"];
    WKPickerItem *pickerItem20 = [WKPickerItem alloc];
    [pickerItem20 setTitle:@"45 lt"];
    WKPickerItem *pickerItem21 = [WKPickerItem alloc];
    [pickerItem21 setTitle:@"50 lt"];
    WKPickerItem *pickerItem22 = [WKPickerItem alloc];
    [pickerItem22 setTitle:@"55 lt"];
    WKPickerItem *pickerItem23 = [WKPickerItem alloc];
    [pickerItem23 setTitle:@"60 lt"];
    WKPickerItem *pickerItem24 = [WKPickerItem alloc];
    [pickerItem24 setTitle:@"65 lt"];
    WKPickerItem *pickerItem25 = [WKPickerItem alloc];
    [pickerItem25 setTitle:@"70 lt"];
    WKPickerItem *pickerItem26 = [WKPickerItem alloc];
    [pickerItem26 setTitle:@"80 lt"];
    WKPickerItem *pickerItem27 = [WKPickerItem alloc];
    [pickerItem27 setTitle:@"85 lt"];
    WKPickerItem *pickerItem28 = [WKPickerItem alloc];
    [pickerItem28 setTitle:@"90 lt"];
    WKPickerItem *pickerItem29 = [WKPickerItem alloc];
    [pickerItem29 setTitle:@"95 lt"];
    WKPickerItem *pickerItem30 = [WKPickerItem alloc];
    [pickerItem30 setTitle:@"100 lt"];
    
    
    _pickerData = [[NSArray alloc] initWithObjects:pickerItem1, pickerItem2, pickerItem3,pickerItem4,pickerItem5,pickerItem6,pickerItem7,pickerItem8,pickerItem9, nil];
    
    _pickerVolumeData = [[NSArray alloc] initWithObjects: pickerItem10, pickerItem11,pickerItem12,pickerItem13,pickerItem14,pickerItem15,pickerItem16,pickerItem17,pickerItem18,pickerItem19,pickerItem20,pickerItem21,pickerItem22,pickerItem23,pickerItem24,pickerItem25,pickerItem26,pickerItem27,pickerItem28,pickerItem29,pickerItem30, nil];
    
    [self.myPicker setItems: _pickerData];
    [self.pickerVolume setItems: _pickerVolumeData];
    
}

-(void)setTableRow:(NSString*)water1:(NSString*)temp1 : (NSString * ) energy1  {
    
    if( numberofrows < 5) {
        
        tableRow *quoteRow = [self.table rowControllerAtIndex:numberofrows];
        
        [quoteRow.rowlabel setText:water1];
        [quoteRow.rowLabel1 setText:temp1];
        [quoteRow.rowLabel2 setText:energy1];
        
        numberofrows++;
        
    }
}

- (void)willActivate {
    // This method is called when watch view controller is about to be visible to user
    [super willActivate];
}

- (void)didDeactivate {
    // This method is called when watch view controller is no longer visible
    [super didDeactivate];
}

- (IBAction)volButton {
    [_myPicker setHidden:YES];
    [_volumeButtonText setHidden:YES];
    [_pickerVolume setHidden:NO];
    [_timerButtonText setHidden:NO];
    tmdur = 0;
    vldur = 1;
}

- (IBAction)timerButton {
    [_pickerVolume setHidden:YES];
    [_timerButtonText setHidden:YES];
    [_myPicker setHidden:NO];
    [_volumeButtonText setHidden:NO];
    tmdur = 1;
    vldur = 0;
}

- (IBAction)thePickerVolume:(NSInteger)value {
    
    if( value == 0) {
        volumeTimerPicker = 5;
    } else if (value == 1) {
        volumeTimerPicker = 8;
    } else if (value == 2) {
        volumeTimerPicker = 10;
    } else if (value == 3) {
        volumeTimerPicker = 12;
    } else if (value == 4) {
        volumeTimerPicker = 16;
    } else if (value == 5) {
        volumeTimerPicker = 20;
    } else if (value == 6) {
        volumeTimerPicker = 25;
    } else if (value == 7) {
        volumeTimerPicker = 30;
    } else if (value == 8) {
        volumeTimerPicker = 35;
    } else if (value == 9) {
        volumeTimerPicker = 40;
    } else if (value == 10) {
        volumeTimerPicker = 45;
    } else if (value == 11) {
        volumeTimerPicker = 50;
    } else if (value == 12) {
        volumeTimerPicker = 55;
    } else if (value == 13) {
        volumeTimerPicker = 60;
    } else if (value == 14) {
        volumeTimerPicker = 65;
    } else if (value == 15) {
        volumeTimerPicker = 70;
    } else if (value == 16) {
        volumeTimerPicker = 75;
    } else if (value == 17) {
        volumeTimerPicker = 80;
    } else if (value == 18) {
        volumeTimerPicker = 90;
    } else if (value == 19) {
        volumeTimerPicker = 100;
    }
    
    //NSLog(@"volume value = %d", volumeTimerPicker);
    
}

- (IBAction)thePicker:(NSInteger)value {
    
    timerDuration = (value + 1)*60;
    
    //NSLog(@"timer value = %d", timerDuration);
    //[_pickerButton setTitle:[NSString stringWithFormat:@"Let's shower: %d min",value+1]];
}

- (IBAction)tapHandler:(id)sender {
    enabled = TRUE;
    [_image setHidden:YES];
    [_firstgesture setEnabled:NO];
    [_secondgesture setEnabled:YES];
    labelfont = [UIFont systemFontOfSize:56];
    [_volume setAttributedText:[[NSAttributedString alloc] initWithString : volstr attributes : @{ NSFontAttributeName : labelfont}]];
}

- (IBAction)volHandler:(id)sender {
    enabled = false;
    [_image setHidden:NO];
    labelfont = [UIFont systemFontOfSize:30];
    [_volume setAttributedText:[[NSAttributedString alloc] initWithString : volstr attributes : @{ NSFontAttributeName : labelfont}]];
    [_groupMain setHidden:YES];
    [_table setHidden:NO];
    [_lastFiveShowers setHidden:NO];
}

- (IBAction)setPickerTime {
    [_pickerGroup setHidden:YES];
    [_groupMain setHidden:NO];
    
}

- (IBAction)pickerBackButton {
    [_pickerGroup setHidden:YES];
    [_groupMain setHidden:NO];
}

- (IBAction)swipeUp:(id)sender {
    [_groupMain setHidden:YES];
    [_pickerGroup setHidden:NO];
}

- (IBAction)tapUsername {
    [self createUsernameInput];
}

- (IBAction)swipeRight:(id)sender {
    //[_groupMain setHidden:YES];
    [_groupMain setHidden:YES];
    [_pickerGroup setHidden:YES];
    [_btnPass setHidden:YES];
    [_btnUsername setHidden:YES];
    [_btnLogout setHidden:NO];
    [_btnBackLogout setHidden:NO];
}

- (IBAction)swipeLeft:(id)sender {
    [_groupMain setHidden:YES];
    [_pickerGroup setHidden:YES];
    [_btnPass setHidden:YES];
    [_btnUsername setHidden:YES];
    [_btnLogout setHidden:NO];
    [_btnBackLogout setHidden:NO];
}

- (IBAction)swipeDown:(id)sender {
    [_groupMain setHidden:YES];
    [_pickerGroup setHidden:NO];
}

- (IBAction)tapHandlerTable:(id)sender {
    [_groupMain setHidden:NO];
    [_table setHidden:YES];
    [_lastFiveShowers setHidden:YES];
    [_firstgesture setEnabled:YES];
    [_secondgesture setEnabled:NO];
}


- (IBAction)tapPass {
    [self createPasswordInput];
}
- (IBAction)tapLogout {
    [_btnLogout setHidden:YES];
    [_groupMain setHidden:YES];
    [_pickerGroup setHidden:YES];
    [_btnPass setHidden:YES];
    [_btnUsername setHidden:NO];
    [myCentralManager stopScan];
    //key = NULL;
    
}
- (IBAction)tapBackLogout {
    [_btnLogout setHidden:YES];
    [_btnBackLogout setHidden:YES];
    [_groupMain setHidden:NO];
    [_pickerGroup setHidden:YES];
    [_btnPass setHidden:YES];
    [_btnUsername setHidden:YES];
}
@end


