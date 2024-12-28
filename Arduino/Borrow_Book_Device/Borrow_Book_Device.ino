#include <NTPClient.h>
#include <WiFiUdp.h>

#include <SPI.h>
#include <MFRC522.h>

#include <FirebaseESP8266.h>
#include <ESP8266WiFi.h>

#include <Wire.h>                 //Thư viện giao tiếp I2C
#include <LiquidCrystal_I2C.h>    //Thư viện LCD

#define SS_PIN D4 // SS pin for RC522 module, connected to D4
#define RST_PIN D3 // RST pin for RC522 module, connected to D3

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance


#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""

#define WIFI_SSID ""
#define WIFI_PASSWORD ""
FirebaseData firebaseData;

LiquidCrystal_I2C lcd(0x27,16,2); //Thiết lập địa chỉ và loại LCD
int totalColumns = 16;
int totalRows = 2;

WiFiUDP u;
NTPClient n(u, "l.asia.pool.ntp.org", 7*3600); //khai báo try cập ntp server khu vực ASIA

void setup() {
  Serial.begin(115200);
  SPI.begin(); // Init SPI bus
  mfrc522.PCD_Init(); // Init RC522
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD); // Connect to Wi-Fi

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  //Display LCD
  Wire.begin(D1,D2);               //Thiết lập chân kết nối I2C (SDA,SCL);
  lcd.init();                      //Khởi tạo LCD
  lcd.clear();                     //Xóa màn hình
  lcd.backlight();                 //Bật đèn nền
  lcd.home();             
  
  n.begin(); //khởi động truy cập server thời gian

  pinMode(D8, OUTPUT);

}
//Chỉ có 1 device là BorrowBookDeviceA
void loop() {
  if(!Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/data")){
    Serial.print("Device is not exist in the firebase, create new ");
    createNewFirebase();
  }

  lcd.display();

  if(Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/detect_danger")){
    String detect_danger_input = firebaseData.stringData();  
    String detect_danger_default = "no";
    String detect_danger_yes = "yes";
    if(detect_danger_input == detect_danger_yes){
      lcd.clear();
      lcd.print("Danger Fire");
      digitalWrite(D8, HIGH);
      delay(700);
      digitalWrite(D8, LOW);
      delay(700);
      digitalWrite(D8, HIGH);
      delay(700);
      digitalWrite(D8, LOW);
      
    } else {
      digitalWrite(D8, LOW);
      Logic();
    }
  }
}

void createNewFirebase(){
  int active = 2;
  String default_input = "null";
  String detect_danger = "no";
  String note = "Device is used to help user borrow a book";
  String type = "borrow_book";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/BorrowBookDeviceA/active", active);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/data", default_input);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/device_message", default_input);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/device_message2", default_input);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/note", note);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/present_user", default_input);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/type", type);
  Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/return_user", detect_danger);
  Firebase.setInt(firebaseData, "/device/BorrowBookDeviceA/realtime", realtime);

}

void Logic(){
  Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/data");
  String input_data = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/detect_danger");
  String input_detect_danger = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/device_message");
  String input_device_message = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/device_message2");
  String input_device_message2 = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BorrowBookDeviceA/present_user");
  String input_present_user = firebaseData.stringData();
  
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    lcd.clear();
    lcd.print("Reading the Card");
    String rfidData = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      rfidData += String(mfrc522.uid.uidByte[i], HEX);
    }
    delay(500);
    // Send RFID data to Firebase
    lcd.clear();
    lcd.print("Processing: ");
    lcd.setCursor(0,1);              //Đặt vị trí ở ô thứ 1 trên dòng 2
    lcd.print(rfidData);
    delay(500);
    String default_input = "null";
    String command_return = "yes";
    String default_return = "no";
    if(input_present_user == rfidData && input_present_user != default_input){ //trường hợp người dùng hoàn thành việc mươn sách
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/return_user", command_return);
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("Done Borrow");
      String user_name = "User: "+ input_device_message;
      scrollMessage(1, user_name, 250, totalColumns);
      delay(1000);
      lcd.clear();
      lcd.print("Return Success");
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/return_user", default_return);
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/data", default_input);
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/present_user", default_input);
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/device_message", default_input );
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/device_message2", default_input );
      delay(500);
    } else {
      Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/data", rfidData);

      if (firebaseData.dataType() == "string") {
        Serial.print("Data sent to Firebase: ");
        Serial.println(firebaseData.stringData());

        Serial.println(rfidData);

        delay(500);
        lcd.clear();
        lcd.print("Done Reading");
        String default_rfid = "null";
        Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/data", default_rfid);
        delay(500);
      } else {
        Serial.println("Failed to send data to Firebase");
        lcd.clear();
        lcd.print("Error sending");
        delay(5000);
      }
    }
  
    delay(500); // Wait a bit before scanning for another card
  } else {
    String default_input = "null";
    String unauthorize_message = "Unauthorize User";
    String not_active_message = "Not Active";
  
    if(input_data == default_input && input_device_message == default_input && input_device_message2 == default_input && input_present_user == default_input){ //trường hợp hệ thống mặc định
      lcd.clear();
      lcd.print("Ready to use");
      delay(500);
    } else if(input_present_user != default_input){ //trường hợp người dùng có trong hệ thống
      if(input_device_message2 == default_input){ //trường hợp chưa có gì xảy ra
        lcd.clear();
        String user_name = "User: "+input_device_message;
        lcd.setCursor(0,1);
        lcd.print("Ready to Read");
        scrollMessage(0, user_name, 240, totalColumns);
        delay(100);
      } else { //phần xử lý logic ở đây để backend
        lcd.clear();
        lcd.setCursor(0,0);
        lcd.print("Process:");
        String message2 = input_device_message2;
        scrollMessage(1, message2, 250, totalColumns);
        Buzz();
        delay(1000);
        Firebase.setString(firebaseData, "/device/BorrowBookDeviceA/device_message2", default_input);
      }
    }
  }
}

void scrollMessage(int row, String message, int delayTime, int totalColumns) {
  for (int i=0; i < totalColumns; i++) {
    message = " " + message;  
  } 
  message = message + " "; 
  for (int position = 0; position < message.length(); position++) {
    lcd.setCursor(0, row);
    lcd.print(message.substring(position, position + totalColumns));
    delay(delayTime);
  }
}

void Buzz(){
  digitalWrite(D8, HIGH);
  delay(500);
  digitalWrite(D8, LOW);
  delay(500);
  digitalWrite(D8, HIGH);
  delay(500);
  digitalWrite(D8, LOW);

}























