let rock_img_url = "https://firebasestorage.googleapis.com/v0/b/rps1-791f5.appspot.com/o/rock.jpg?alt=media&token=3485b870-fc79-425d-9b5f-43849d7bb71a";
let paper_img_url = "https://firebasestorage.googleapis.com/v0/b/rps1-791f5.appspot.com/o/paper.jpg?alt=media&token=5b71ddb0-a0e0-4001-bef2-cfec9e4b15b7";
let scissors_img_url = "https://firebasestorage.googleapis.com/v0/b/rps1-791f5.appspot.com/o/scissors.jpg?alt=media&token=b9ceadaa-312a-411b-8f23-0260049ea7a8";

document.getElementById("rock").addEventListener("click", rockFunction);
document.getElementById("paper").addEventListener("click", paperFunction);
document.getElementById("scissors").addEventListener("click", scissorsFunction);

function rockFunction() {
  document.replaceElement("rock", rock_img_url);
}
function paperFunction() {
  document.replaceElement("paper", paper_img_url);
}
function scissorsFunction() {
  document.replaceElement("scissors", scissors_img_url);
}

document.replaceElement = function(content, content_url) {
  disable_interval = 1000;
  document.getElementById("rock").disabled = true;
  setTimeout(function(){document.getElementById("rock").disabled = false;},disable_interval);
  document.getElementById("paper").disabled = true;
  setTimeout(function(){document.getElementById("paper").disabled = false;},disable_interval);
  document.getElementById("scissors").disabled = true;
  setTimeout(function(){document.getElementById("scissors").disabled = false;},disable_interval);
  userChoice = content;
  document.querySelector('userInput').innerHTML = content;
  content_img = '<img class="choice-img" src="'+content_url+'">';
  document.querySelector('userInputUrl').innerHTML = content_img;
  updateGameInfo()
  addOrUpdateDB("false");
};

let current;
let secondsLeft;
let gameTimer;
let difference_in_minute;
let userChoice;
let gameNumber;
let startTime = new Date("2021-01-01T00:00:00.000Z"); //game stating time
const gameLenth = 20; //the seconds each game will last

function updateGameInfo() {
  current = new Date();
  var currentSec = current.getSeconds();
  secondsLeft = (Math.floor(currentSec/gameLenth)+1)*gameLenth - currentSec;
  var diff = (current.getTime() - startTime.getTime())/1000;
  gameNumber = Math.floor(diff / gameLenth);
  document.getElementById("gameNumber").textContent = gameNumber;
  clearInterval(gameTimer);
  gameTimer = setInterval(function(){
    secondsLeft--;
    document.getElementById("counter").textContent = secondsLeft;
    if(secondsLeft <= 1){
      document.getElementById("rock").disabled = true;
      document.getElementById("paper").disabled = true;
      document.getElementById("scissors").disabled = true;
    }
    if(secondsLeft <= 0){
      clearInterval(gameTimer);
      document.getElementById("gameNumber").textContent = ""
      document.getElementById("counter").textContent = ""
      document.getElementById("status").textContent = ""
      addOrUpdateDB("true");
      document.getElementById("rock").disabled = false;
      document.getElementById("paper").disabled = false;
      document.getElementById("scissors").disabled = false;
    }
    },1000);
}

function addOrUpdateDB(isEnd){
  db.collection('choice').where("gameNumber", "==", gameNumber).where("uid", "==", uid)
  .get()
  .then(snapshot => {
    console.log("isEnd--"+isEnd);
    if(snapshot.empty){
      db.collection('choice')
      .add({
        uid: uid,
        userChoice: userChoice,
        gameNumber: gameNumber,
        })
      .then(docRef => {
        console.log(`Document written with ID: ${docRef.id}`)
        queryCurrentGame();
      })
      .catch(error => {
        console.log(`Error adding document: ${error}`)
      })
    }
    else{
      snapshot.forEach(doc => {
        if(isEnd==="true"){
          numOfRock = 0;
          numOfPaper = 0;
          numOfScissors = 0;
          db.collection('choice').where("gameNumber", "==", gameNumber)
          .get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              var choice = doc.data().userChoice;
              console.log(choice)
              if(choice==="rock"){
                numOfRock++;
              }
              else if (choice==="paper") {
                numOfPaper++;
              }
              else{
                numOfScissors++;
              }
            })
            var delta = 0
            if(userChoice==="rock"){
              delta += numOfScissors;
              delta -= numOfPaper;
            }
            else if(userChoice==="paper"){
              delta += numOfRock;
              delta -= numOfScissors
            }
            else{
              delta += numOfPaper;
              delta -= numOfRock
            }
            doc.ref.update({
              userChoice: userChoice,
              rock: numOfRock,
              paper: numOfPaper,
              scissors: numOfScissors,
              delta: delta,
            })
            db.collection('user')
            .where('uid', '==', uid)
            .onSnapshot(snapshot => {
            	snapshot.forEach(userdoc => {
                let points = userdoc.data().points;
                points += delta;
                numOfRock = 0;
                numOfPaper = 0;
                numOfScissors = 0;
                delta = 0;
                isEnd = false;
                document.querySelector('userInput').innerHTML = ''
                userdoc.ref.update({
                  points: points
                })
                document.getElementById('points').textContent = points;
            	})
            })
          })
          .catch(error => {
              console.log(`Error getting documents: ${error}`)
          })
        }
        else{
          doc.ref.update({
            userChoice: userChoice,
          })
          queryCurrentGame();
        }
      })
    }

  })
  .catch(error => {
      console.log(`Error getting documents: ${error}`)
  })
}

function queryCurrentGame(){
  let numOfRock = 0;
  let numOfPaper = 0;
  let numOfScissors = 0;
  db.collection('choice').where("gameNumber", "==", gameNumber)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      var choice = doc.data().userChoice;
      console.log(choice)
      if(choice==="rock"){
        numOfRock++;
      }
      else if (choice==="paper") {
        numOfPaper++;
      }
      else{
        numOfScissors++;
      }
    })
    document.getElementById("status").textContent = "Rock: "+numOfRock+"; Paper: "+numOfPaper+"; Scissors: "+numOfScissors
    return [numOfRock,numOfPaper,numOfScissors];
  })
  .catch(error => {
      console.log(`Error getting documents: ${error}`)
  })
}
