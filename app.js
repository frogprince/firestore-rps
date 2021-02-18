// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyCSt6myFuqQANImP6VKcrANVsXCGyi_4OU",
    authDomain: "rps1-791f5.firebaseapp.com",
    projectId: "rps1-791f5",
    storageBucket: "rps1-791f5.appspot.com",
    messagingSenderId: "69805192870",
    appId: "1:69805192870:web:79ae9e78a348c4d836e667",
    measurementId: "G-1L93BDGET9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// declare uid globally so you can access it throughout your app
let uid
let name

var db = firebase.firestore()




document.querySelector('#change-name').addEventListener('click', () => {
  auth.signOut();
  hideAuthElements();
})



// Access the modal element
const modal = document.getElementById(`modal`);
// Access the element that closes the modal
const close = document.getElementById(`close`);
// Access the forms for email and password authentication
const createUserForm = document.getElementById('create-user-form')
const signInForm = document.getElementById('sign-in-form')

// When the user clicks the (x) button close the modal
close.addEventListener(`click`, () => {
    modal.style.display = `none`;
});

// When the user clicks anywhere outside of the modal close it.
window.addEventListener(`click`, event => {
	if (event.target == modal){
		modal.style.display = `none`;
	};
});

// Invoked when user wants to create a new user account
showCreateUserForm = () => {
  hideAuthElements()
  modal.style.display = 'block'
  createUserForm.classList.remove('hide')
}

// Invoked when a user wants to sign in
showSignInForm = () => {
  hideAuthElements()
  modal.style.display = 'block'
  signInForm.classList.remove('hide')
}

// Invoked at the start of auth functions in order to hide everything before selectively showing the correct form
hideAuthElements = () => {
  document.getElementById('auth-message').innerHTML = ''
  createUserForm.classList.add('hide')
  signInForm.classList.add('hide')
}

// Access auth elements to listen for auth actions
const authAction = document.querySelectorAll('.auth')

// Loop through elements and use the associated auth attribute to determine what action to take when clicked
authAction.forEach(eachItem => {
    eachItem.addEventListener('click', event => {
        let chosen = event.target.getAttribute('auth')
        if (chosen === 'show-create-user-form'){
            showCreateUserForm()
        } else if (chosen === 'show-sign-in-form'){
            showSignInForm()
        }
    })
})

// Reference to auth method of Firebase
const auth = firebase.auth()

auth.onAuthStateChanged(user => {
    if (user) {
        // Everything inside here happens if user is signed in
        console.log(user)
        // this assigns a value to the variable 'uid'
        uid = user.uid
        modal.style.display = `none`

        // Hides or shows elements depending on if user is signed in
        hideWhenSignedIn.forEach(eachItem => {
          eachItem.classList.add('hide')
        });
        hideWhenSignedOut.forEach(eachItem => {
          eachItem.classList.remove('hide')
        });

        if (user.displayName) {
          document.getElementById('name').textContent = `${user.displayName}`
          name = user.displayName
        }

        db.collection('user')
        .where('uid', '==', uid)
        .onSnapshot(snapshot => {
          if(snapshot.empty){
            db.collection('user')
            .add({
              uid: uid,
              points: 0,
              })
            .then(docRef => {
              console.log(`Document written with ID: ${docRef.id}`)
              queryCurrentGame();
            })
            .catch(error => {
              console.log(`Error adding document: ${error}`)
            })
            document.getElementById('points').textContent = `0`
          }
          else{
            db.collection('user')
            .where('uid', '==', uid)
            .onSnapshot(snapshot => {
            	document.querySelector('#messages').innerHTML = ''
            	snapshot.forEach(doc => {
                let points = doc.data().points;
                document.getElementById('points').textContent = points;
            	})
            })
          }
          db.collection('choice')
          .where('uid', '==', uid)
          .orderBy('gameNumber', 'desc')
          .onSnapshot(snapshot => {
          	document.querySelector('#messages').innerHTML = '\
            <tr>\
              <th>Game #</th>\
              <th>Your Choice</th>\
              <th>Rock #</th>\
              <th>Paper #</th>\
              <th>Scissors #</th>\
              <th>Points Gained</th>\
            </tr>'
          	snapshot.forEach(doc => {
              var message = document.createElement('tr')
              var gameNumber = doc.data().gameNumber
              var userChoice = doc.data().userChoice
              var rock = doc.data().rock
              var paper = doc.data().paper
              var scissors = doc.data().scissors
              var delta = doc.data().delta
              if(rock===undefined){
                return;
              }
          		message.innerHTML = `
                <td>${gameNumber}</td>
                <td>${userChoice}</td>
                <td>${rock}</td>
                <td>${paper}</td>
                <td>${scissors}</td>
                <td>${delta}</td>`
          		document.querySelector('#messages').append(message)
          	})
          })
        })
    } else {
        // Everything inside here happens if user is not signed in
        console.log('not signed in')
        // Hides or shows elements depending on if user is signed out
        hideWhenSignedIn.forEach(eachItem => {
          eachItem.classList.remove('hide')
        });
        hideWhenSignedOut.forEach(eachItem => {
          eachItem.classList.add('hide')
        });
    }
})

// Access elements that need to be hidden or show based on auth state
const hideWhenSignedIn = document.querySelectorAll('.hide-when-signed-in')
const hideWhenSignedOut = document.querySelectorAll('.hide-when-signed-out')

// Create user form submit event
createUserForm.addEventListener(`submit`, event => {
	event.preventDefault();
	// Grab values from form
  const displayName = document.getElementById(`create-user-display-name`).value;
  const email = document.getElementById(`create-user-email`).value;
	const password = document.getElementById(`create-user-password`).value;
	// Send values to Firebase
	auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
     auth.currentUser.updateProfile({
        displayName: displayName,
     })
     createUserForm.reset();
     hideAuthElements();
    })
    .catch(error => {
     console.log(error.message);
     document.getElementById('auth-message').innerHTML=error.message
    });
});

// Sign in form submit event
signInForm.addEventListener('submit', event => {
	event.preventDefault()
	// Grab values from form
  const email = document.getElementById('sign-in-email').value
	const password = document.getElementById('sign-in-password').value
	// Send values to Firebase
	auth.signInWithEmailAndPassword(email, password)
    .then(() => {
     signInForm.reset()
     hideAuthElements()
    })
    .catch(error => {
     console.log(error.message)
     document.getElementById('auth-message').innerHTML=error.message
    })
})
