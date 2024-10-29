import readlineSyncModule from "readline-sync";
import fileSystem from "fs";
import CryptoJS from 'crypto-js';

// const data = 'apple'; //암호를 진행할때 데이터를 작성
// const secretKey = '1q2w3e4r'; //암호화를 진행할때 설정할 비밀번호

// //encrypt를 사용해 암호화하기
// const bytes = CryptoJS.AES.encrypt(data, secretKey); //암호화 진행
// const bytesString = bytes.toString(); //암호화된 데이터를 문자열로 변환 ->평문으로 사용할라꼬

// console.log('bytesString: ',bytesString); //암호화된 데이터 출력

// //decrypt를 사용해 복호화하기
// const decryptBytes = CryptoJS.AES.decrypt(bytesString, secretKey); //복호화 진행
// const decryptBytesString = decryptBytes.toString(CryptoJS.enc.Utf8); //복호화된 데이터를 문자열로 변환

// console.log('decryptBytesString: ',decryptBytesString); //복호화된 데이터 출력

//1번
//메모를 잠금처리하고 잠금 해제할 수 있도록 구현
//1.예외처리 기본 적용. -> 조회, 수정, 삭제 시도할 시 사용x
//2.잠금 처리된 메모는 '(잠금)' 이라는 텍스트가 파일명 앞에 붙게 구현.

//2번
//1.조회 수정 삭제 기능에 잠금 처리된 메모의 잠금을 풀고 수정/삭제 할 수 있도록
//2.프로그램 사용자가 메모를 모두 사용한 후에는 다시 잠금처리 할 지 여부를 물어봐서 결정하도록 합니다.
//3.암호화를 사용하는 부분을 함수를 사용해 재사용해 보세요.

//메뉴 리스트
var menu = ["Write", "Inquiry", "Modify", "Delete", "ExtraFunc","Lock","Exit"];
//제목 리스트
const title = [];
//내용리스트
const content = [];

var userSelect;
var isright;

var memoTitle;
var memoContent;

var isPlaying = true;

//json 파일
const jsonFile = "Memo.json";
//기존 json 파일
var fileContent;

//(+)암호화 비밀키
const secretKey = "memo";

//(1)메모 목록보기
function showMemoList() {
  console.log("<Memo List>");
  console.log(title.map((item, index) => `${index + 1}.${item}`).join("\n"));
}

//(2)사용자 입력부분
function userSelectMenu() {userSelect = parseInt(readlineSyncModule.question("Please Select the number: "));}

//(3)JSON 파일로 저장
function saveMemo() {
  //파일 생성여부 확인
  if (fileSystem.existsSync(jsonFile)) {
    //기존 파일 읽기
    fileContent = fileSystem.readFileSync(jsonFile, "utf-8");

    //기존 파일+ 새 데이터 추가 + push하기 위해 parse 사용
    let jsonData = JSON.parse(fileContent);
    jsonData.push({ title: memoTitle, content: memoContent });

    fileSystem.writeFileSync("Memo.json", JSON.stringify(jsonData), "utf-8");
  } else {
    //배열형태로 저장
    const initialData = [{ title: memoTitle, content: memoContent }];
    //json 파일로 저장
    fileSystem.writeFileSync("Memo.json", JSON.stringify(initialData), "utf-8");
  }
}

//(4)작성::여러줄 작성하기
function writeContent() {
  let output = "";
  console.log("Enter the content(if you want to stop writing, please enter 'done'):");
  while (true) {
    const contentLine = readlineSyncModule.question("");
    if (contentLine === "done") {
      break;
    } else {
      output += contentLine + "\n";
    }
  }
  //마지막 \n 제거
  output = output.trim();
  return output;
}

//데이터 암호화
function encryptData(data){
    const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
    console.log(`Encrypted data: (lock)${encryptedData}`);
    return `(lock)${encryptedData}`;
}

//데이터 복호화
function decryptData(data){
    const decryptedData = CryptoJS.AES.decrypt(data,secretKey).toString(CryptoJS.enc.Utf8);
    console.log(`Decrypted data: ${decryptedData}`);
}

//데이터 암호화 여부
function isEncryptedData(data){return data.startsWith("(lock)");}

//메모장 기능

//1.작성
function Write() {
  //Note: 내용 여러줄 입력 가능하도록 수정
  memoTitle = readlineSyncModule.question("Enter the title: ");
  if(memoTitle === ""){
    console.log("The title cannot be blank.")
    //ERROR: 여기서 Write()를 호출하면 Write()를 계속 호출하는 꼴. 공백 횟수 만큼 writeContent()가 호출된다.
    //Write();
    return;
  }
  memoContent = writeContent();

  //제목,내용 리스트에 추가
  title.push(memoTitle);
  content.push(memoContent);

  //JSON 파일로 저장
  saveMemo();
}

//2.조회
function Inquiry() {
  //제목 리스트 출력
  showMemoList();
  userSelectMenu();
  //잘못된 입력은 early return
  if(userSelect>title.length|| userSelect <=0){console.log("There is no memo.");return;}

  if(isEncryptedData(title[userSelect-1])){console.log("The memo is already locked");return;}

  //선택한 번호에 해당하는 메모,내용 출력
  console.log(`Title:` + title[userSelect - 1] + "\nContent:" + content[userSelect - 1]);
}

//3.수정
function Modify() {
  showMemoList();
  userSelectMenu();

  //잘못된 입력은 early return
  if(userSelect>title.length|| userSelect <=0){console.log("There is no memo.");return;}

  //암호화 여부 확인
  if(isEncryptedData(title[userSelect-1])){console.log("The memo is already locked");return;}

  memoTitle = readlineSyncModule.question("Modify the Title: ");
  memoContent = readlineSyncModule.question("Modify the Cotent:");

  //수정한 내용으로 메모 변경
  title[userSelect - 1] = memoTitle;
  content[userSelect - 1] = memoContent;
  //FIXME: 수정한 메모를 JSON파일에 반영하는 부분 추가
}

//4.삭제
function Delete(){
  showMemoList();
  userSelectMenu();

  //잘못된 입력은 early return
  if(userSelect>title.length|| userSelect <=0){console.log("There is no memo.");return;}

  //암호화 여부 확인
  if(isEncryptedData(title[userSelect-1])){console.log("The memo is already locked");return;}

  //삭제 여부 확인
  isright = parseInt(readlineSyncModule.question("Do you want to delete the memo? /yes(1) or no(0):"));

  if(isright !==1){
    console.log("Cancel the delete.");
    return;
  }

  //확인 후 메모 삭제
  title.splice(userSelect-1,1);
  content.splice(userSelect-1,1);
  console.log("Delete the memo.");
  //FIXME: 삭제한 메모를 JSON파일에서도 삭제기능 추가

}

//5.추가기능:메모 불러오기
function ExtraFunc(){
  console.log("Retrieving the notes.");

  //파일 여부 확인
  if (fileSystem.existsSync(jsonFile)) {
    fileContent = fileSystem.readFileSync(jsonFile, "utf-8");
    let jsonData = JSON.parse(fileContent);

  //★SOLVE: 배열 초기화 후 json 데이터 추가
  //title = [];
  //content = [];

  //FIXME : const title로 변경 후 title=[]로 초기화 에러 발생5
    title.length=0;
    content.length=0;

  //★FIXME: 중복으로 불러와지는 문제 발생
  //title,content 배열에 json 데이터 추가
  jsonData.forEach((memo) => {
    title.push(memo.title);
    content.push(memo.content);
  });
  console.log("The notes have been retrieved.");
  } else {
    console.log("There is no note to retrieve.");
  }
}

//(+)6.잠금
function Lock(){
    showMemoList();
    userSelectMenu();

    //잘못된 입력은 early return
    if(userSelect>title.length|| userSelect <=0){console.log("There is no memo.");return;}
    
    //1. 잠금여부 확인 : 앞 (잠금) 여부로 판단
    //FIXME : 잠금 여부 더 정확하게 할 수 있는 방법으로 수정
    //ERROR : indexOf() 작동안됨
    // if(title[userSelect-1].indexOf("(lock)") ===0){console.log("The memo is already locked.");return;}
    if(isEncryptedData(title[userSelect-1])){console.log("The memo is already locked");return;}

    //2. 잠금x -> 잠금설정
    //title[userSelect-1]=encryptData(title[userSelect-1]);
    title[userSelect-1] = '(lock)'+title[userSelect-1];
    content[userSelect-1]=encryptData(content[userSelect-1]);

    console.log("The memo is locked.");

    //3. 잠금 후 title 앞에 (잠금)추가 -> return을 잠금으로 반환
}

function Unlock(){
    showMemoList();
    userSelectMenu();

    //잘못된 입력은 early return
    if(userSelect>title.length|| userSelect <=0){console.log("There is no memo.");return;}

    //잠금 해제 여부 확인 -> false로 반환되면 true가 되도록
    if(!isEncryptedData(title[userSelect-1])){console.log("The memo is already unlocked");return;}

    //잠금해제
    title[userSelect-1] = title[userSelect-1].replace('(lock)','');
    content[userSelect-1]=decryptData(content[userSelect-1]);

    console.log("The memo is unlocked.")

}


while (isPlaying) {
  console.log("--------------------");
  console.log(menu.map((item, index) => `${index + 1}.${item}`).join(" "));

  userSelectMenu();

  switch (userSelect) {
    case 1: //Write
      Write();
      break;

    case 2: //Inquiry
      Inquiry();
      break;

    case 3: //Modify
      Modify();
      break;
      
    case 4: //Delete
      Delete();
      break;

    case 5: //ExtraFunc:메모 불러오기
      ExtraFunc();
      break;

    case 6://Lock
      Lock();
      break;
    case 7://Unlock
      Unlock();
      break;
    case 8:
      console.log("Exit the program.");
      isPlaying = false;
      break;

    default:
      console.log("Fault menu.\n");
  }
}


