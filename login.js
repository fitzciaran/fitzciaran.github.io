import { player } from "./main.js";
import { DbPropertyKey, DbDocumentKey, incrementFirebaseGivenPropertyValue, readUserDataFromFirestore, updateAchievements } from "./db.js";
import { setAchievementsTitle } from "/gameLogic.js";

const emailInput = {
  x: 50,
  y: 50,
  width: 200,
  height: 30,
  text: "",
};

const passwordInput = {
  x: 50,
  y: 100,
  width: 200,
  height: 30,
  text: "",
};

export const loginButton = {
  x: 50,
  y: 50,
  width: 200,
  height: 40,
  text: "Login with Google",
};

export const achievementsTitleText = {
  YOUR_ACHIEVEMENTS: "Your achievements",
  LOGIN_TO_TRACK: "login to track your achievements",
};

let googleSignInPopupOpen = false;

// Function to draw a rounded rectangle.
function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function drawLoginForm(ctx) {
  // Function to calculate the width of the text.
  function getTextWidth(text, font) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  // Could update loginButton text here... but then I'm doing that every tick...

  // Calculate the width of the updated text.
  const textWidth = getTextWidth(loginButton.text, "bold 12px Arial");

  // Adjust the button width to fit the text.
  loginButton.width = textWidth + 50; // You can adjust the padding as needed.

  // Draw login button.
  ctx.fillStyle = "blue";
  drawRoundRect(ctx, ctx.canvas.width - loginButton.width - loginButton.x, loginButton.y, loginButton.width, loginButton.height, 5);

  ctx.fillStyle = "white";
  ctx.fillText(loginButton.text, ctx.canvas.width - loginButton.width - loginButton.x + 25, loginButton.y + 20);
}

function firebaseLogin(firebase, email, password) {
  // Initialize Firebase app if it's not already initialized.
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User signed in with email and password.
      const user = userCredential.user;
      console.log(`Signed in as ${user.email}`);
      loginButton.text = `${user.email}`;
      player.setPlayerName(user.displayName);
      setAchievementsTitle(achievementsTitleText.YOUR_ACHIEVEMENTS);
    })
    .catch((error) => {
      // Handle login errors.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Login failed with error code: ${errorCode}, message: ${errorMessage}`);
      // You can display an error message to the user on the canvas or in another way.
    });
}

export function firebaseGoogleLogin() {
  // If a popup is already open, don't open another one.
  if (googleSignInPopupOpen) {
    return;
  }

  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

  // Set the boolean variable to true to indicate that a popup is open.
  googleSignInPopupOpen = true;

  firebase
    .auth()
    .signInWithPopup(googleAuthProvider)
    .then((userCredential) => {
      // User signed in with Google.
      const user = userCredential.user;
      console.log(`Signed in with Google as ${user.displayName}`);
      loginButton.text = `${user.email}`;
      player.setPlayerName(user.displayName);
      setSignInCookie();
      //   updateLoginsCount(firebase);
      //   incrementFirebaseLoginsValue(firebase);
      incrementFirebaseGivenPropertyValue(firebase, DbPropertyKey.LOGINS, 1);
      setAchievementsTitle(achievementsTitleText.YOUR_ACHIEVEMENTS);
    })
    .catch((error) => {
      // Handle Google Sign-In errors.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Google Sign-In failed with error code: ${errorCode}, message: ${errorMessage}`);
      // You can display an error message to the user on the canvas or in another way.
    })
    .finally(() => {
      // Set the boolean variable to false when the popup is closed.
      googleSignInPopupOpen = false;
    });
}

function setSignInCookie() {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Cookie expires in 7 days
  document.cookie = `user_signed_in=true; expires=${expirationDate.toUTCString()}; path=/`;
}

// Function to check if the user is signed in (cookie exists).
function isUserSignedIn() {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "user_signed_in" && value === "true") {
      return true;
    }
  }
  return false;
}

export function autoSignInWithGoogle(firebase) {
  if (!isUserSignedIn()) {
    // Don't want to auto make them login
    // firebaseGoogleLogin();
  } else if (!firebase.auth().currentUser) {
    // If the user is signed in via the cookie but not authenticated in the current session we log them in again.
    firebaseGoogleLogin();
  } else {
    //handle user logged in
    // updateLoginsCount(firebase);
    //   incrementFirebaseLoginsValue(firebase);
    incrementFirebaseGivenPropertyValue(firebase, DbPropertyKey.LOGINS, 1);
    setAchievementsTitle(achievementsTitleText.YOUR_ACHIEVEMENTS);
    let loginButtonText = `${firebase.auth().currentUser.email}`;
    player.setPlayerName(firebase.auth().currentUser.displayName);
    readUserDataFromFirestore(firebase, DbDocumentKey.USERS, (error, userData) => {
      if (error) {
        if (error.message === "User not logged in") {
          console.log("User is not logged in.");
          // Handle not logged in state in your UI.
        } else {
          console.error(`Error reading user data: ${error.message}`);
          // Handle other errors, such as data not found, in your UI.
        }
      } else {
        const loginsCount = userData.logins || 0;
        console.log(`Logins count: ${loginsCount}`);
        // Use the logins count in your UI.
      }
    });
    loginButton.text = loginButtonText;
  }
}

function firebaseLogout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      console.log("User signed out");
      // You can add any post-logout logic here, such as redirecting to a login screen.
      // For example, you could call a function to show the login form:
      // showLoginForm();
    })
    .catch((error) => {
      // Handle errors, if any.
      console.error("Logout failed:", error);
    });
}

// Function to update the logins count for the current user.
function updateLoginsCount(firebase) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(DbDocumentKey.USERS).doc(user.uid);

    // Get the current logins count and increment it by 1.
    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const loginsCount = doc.data().logins || 0;
          const newLoginsCount = loginsCount + 1;

          // Update the logins count in Firestore.
          userRef
            .update({ logins: newLoginsCount })
            .then(() => {
              console.log(`Logins count updated to ${newLoginsCount}`);
              // You can also update the user interface with the new logins count here.
            })
            .catch((error) => {
              console.error(`Error updating logins count: ${error}`);
            });
        } else {
          // User document doesn't exist; create it and set logins count to 1.
          userRef
            .set({ logins: 1 })
            .then(() => {
              console.log("Logins count created and set to 1");
              // You can also update the user interface with the logins count here.
            })
            .catch((error) => {
              console.error(`Error creating logins count: ${error}`);
            });
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
      });
  }
}
