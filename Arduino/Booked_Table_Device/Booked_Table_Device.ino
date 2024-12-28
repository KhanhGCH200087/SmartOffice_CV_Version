#include <NTPClient.h>

#include <SPI.h>
#include <MFRC522.h>

#include <FirebaseESP8266.h>

#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

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

  //Control led over Firebase
  pinMode(D0, OUTPUT); //điều khiển Led
  pinMode(D8, OUTPUT);

  //Display LCD
  Wire.begin(D1,D2);               //Thiết lập chân kết nối I2C (SDA,SCL);
  lcd.init();                      //Khởi tạo LCD
  lcd.clear();                     //Xóa màn hình
  lcd.backlight();                 //Bật đèn nền
  lcd.home();             
  //lcd.print("Ready To Read");

  n.begin(); //khởi động truy cập server thời gian
}

//Có 3 device bao gồm BookedTableA1, BookedTableA2, BookedTableB1 
//Lúc làm nhớ chỉnh lại chỗ Led để thêm đèn hiệu và ổ điện
void loop() {
  if(!Firebase.getString(firebaseData, "/device/BookedTableB1/data")){
    Serial.print("Device is not exist in the firebase, create new ");
    createNewFirebase();
  }

  lcd.display();

  if(Firebase.getString(firebaseData, "/device/BookedTableB1/detect_danger")){
    String detect_danger_input = firebaseData.stringData();  
    String detect_danger_default = "no";
    if(detect_danger_input != detect_danger_default){
      lcd.clear();
      lcd.print("   Danger Fire");
    } else {
      sendRFIDtoFirebase();
      processFirebase();
    }
  }
}

void createNewFirebase(){
  int active = 2;
  String available_user = "null";
  String data = "null";
  String detect_danger = "no";
  String device_message = "null";
  String note = "Device is used to booked table";
  String type = "booked_table";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/BookedTableB1/active", active);
  Firebase.setString(firebaseData, "/device/BookedTableB1/available_user", available_user);
  Firebase.setString(firebaseData, "/device/BookedTableB1/data", data);
  Firebase.setString(firebaseData, "/device/BookedTableB1/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/BookedTableB1/device_message", device_message);
  Firebase.setString(firebaseData, "/device/BookedTableB1/note", note);
  Firebase.setString(firebaseData, "/device/BookedTableB1/type", type);
  Firebase.setInt(firebaseData, "/device/BookedTableB1/realtime", realtime);
}

void sendRFIDtoFirebase(){
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    if(Firebase.getString(firebaseData, "/device/BookedTableB1/available_user")){
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

      String input_available_user = firebaseData.stringData();
      String default_input = "null";
      String command_return = "return table";
      if(input_available_user == rfidData && input_available_user != default_input){
        Firebase.setString(firebaseData, "/device/BookedTableB1/data", command_return);
        // digitalWrite(D0, LOW);
        digitalWrite(D8, LOW);
        lcd.clear();
        lcd.setCursor(0,0);              
        lcd.print("Return Table");
        lcd.setCursor(0,1);              
        lcd.print("In Process");
        delay(10000);
        lcd.clear();
        lcd.print("Return Success");
        Firebase.setString(firebaseData, "/device/BookedTableB1/data", default_input);
        Firebase.setString(firebaseData, "/device/BookedTableB1/available_user", default_input);
        Firebase.setString(firebaseData, "/device/BookedTableB1/device_message", default_input );
        delay(500);
      } else {
        Firebase.setString(firebaseData, "/device/BookedTableB1/data", rfidData);

        if (firebaseData.dataType() == "string") {
          Serial.print("Data sent to Firebase: ");
          Serial.println(firebaseData.stringData());

          Serial.println(rfidData);

          delay(700);
          lcd.clear();
          lcd.print("Done Reading");
          String default_rfid = "null";
          Firebase.setString(firebaseData, "/device/BookedTableB1/data", default_rfid);

        } else {
          Serial.println("Failed to send data to Firebase");
          lcd.clear();
          lcd.print("Error sending");
          delay(5000);
        }
      }
    
      delay(500); // Wait a bit before scanning for another card

    }
  }
}

void processFirebase(){
  if(Firebase.getString(firebaseData, "/device/BookedTableB1/device_message")){
    String message_data = firebaseData.stringData();  

    String default_message = "null";
    String denied_message = "Denied User";
    String welcome_message = "Welcome User";
    String default_data = "null";

    if(message_data == default_message){
      Serial.println("Default System");
      lcd.clear();
      lcd.print("Free Table");
      // digitalWrite(D0, LOW);
      digitalWrite(D8, LOW);
      delay(500);
    } else if(message_data != default_message){
      if(message_data == denied_message){
        lcd.clear();
        lcd.print("Service Refuse");
        // digitalWrite(D0, LOW);
        digitalWrite(D8, LOW);
        Firebase.setString(firebaseData, "/device/BookedTableB1/data", default_data);
        delay(500);
      } else if(message_data == welcome_message){
        lcd.clear();
        lcd.print(welcome_message);
        Firebase.setString(firebaseData, "/device/BookedTableB1/data", default_data);
        // digitalWrite(D0, HIGH);
        digitalWrite(D8, HIGH);

        delay(500);
      }
    }
  }
}





