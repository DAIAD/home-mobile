//
//  InterfaceController.h
//  DAIAD watch Extension
//
//  Created by Nikolas Georgomanolis on 03/07/2017.
//

#import <WatchKit/WatchKit.h>
#import <Foundation/Foundation.h>

@interface InterfaceController : WKInterfaceController

@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *volumeLabel;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *volume;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *duration;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *temperature;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *energy;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *tempLabel;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *energyLabel;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceImage *image;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceGroup *energyGroup;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *durationValue;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceGroup *tempGroup;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceTable *table;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceGroup *groupMain;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *lastFiveShowers;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceGroup *firstTap;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceGroup *secondTap;
@property (unsafe_unretained, nonatomic) IBOutlet WKTapGestureRecognizer *firstgesture;
@property (unsafe_unretained, nonatomic) IBOutlet WKTapGestureRecognizer *secondgesture;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *efficiency;

@property (unsafe_unretained, nonatomic) IBOutlet WKInterfacePicker *myPicker;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfacePicker *pickerVolume;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceGroup *pickerGroup;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *pickerButton;
- (IBAction)volButton;
- (IBAction)timerButton;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *timerButtonText;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *volumeButtonText;

- (IBAction)thePickerVolume:(NSInteger)value;

- (IBAction)thePicker:(NSInteger)value;
- (IBAction)tapHandler:(id)sender;
- (IBAction)tapHandlerTable:(id)sender;
- (IBAction)volHandler:(id)sender;
- (IBAction)setPickerTime;
- (IBAction)pickerBackButton;
- (IBAction)swipeRight:(id)sender;
- (IBAction)swipeLeft:(id)sender;
- (IBAction)swipeDown:(id)sender;

- (IBAction)swipeUp:(id)sender;

- (IBAction)tapUsername;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *btnUsername;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *btnPass;
- (IBAction)tapPass;
@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceLabel *pleaseWait;


@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *btnLogout;
- (IBAction)tapLogout;

@property (unsafe_unretained, nonatomic) IBOutlet WKInterfaceButton *btnBackLogout;
- (IBAction)tapBackLogout;

@end



