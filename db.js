import { updateTopScoresInfo } from "/canvasDrawingFunctions.js";

let firebaseConfig = {
  apiKey: "AIzaSyAKNQY57EwlQ6TAf13wSx4eba4NK-MAN88",
  authDomain: "p2p-game-test.firebaseapp.com",
  projectId: "p2p-game-test",
  storageBucket: "p2p-game-test.appspot.com",
  messagingSenderId: "849363353418",
  appId: "1:849363353418:web:13c04c4ac2ef99c88b4bb3",
};
firebase.initializeApp(firebaseConfig);

export let allTimeKills = 0;
export let allTimePoints = 0;
export let allTimeLogins = 0;

export const DbPropertyKey = {
  LOGINS: "logins",
  KILLS: "kills",
  SCORE: "score",
};

export const DbDocumentKey = {
  USERS: "users",
};

// import {} from "firebase/auth";
export function getFirebase() {
  return firebase;
}

export let firebaseDb = firebase.firestore();

export function addScoreToDB(category, name, score) {
  var collection = firebaseDb.collection(category);

  // Get the current top 10 scores
  collection
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      // Count the number of scores in the category
      const numScores = querySnapshot.size;

      // If there are fewer than 10 scores, add the new score
      if (numScores < 10) {
        collection
          .add({
            name: name,
            score: score,
            date: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(function (docRef) {
            console.log("Score written with ID: ", docRef.id);
          })
          .catch(function (error) {
            console.error("Error adding score: ", error);
          });
      } else {
        // Otherwise, check if the new score is in the top 10
        var lowestScore = null;

        querySnapshot.forEach((doc) => {
          if (lowestScore == null || doc.data().score < lowestScore) {
            lowestScore = doc.data().score;
          }
        });

        if (score > lowestScore) {
          collection
            .add({
              name: name,
              score: score,
              date: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(function (docRef) {
              console.log("Score written with ID: ", docRef.id);
            })
            .catch(function (error) {
              console.error("Error adding score: ", error);
            });
        }
      }
    });
}

export function getTopScores(category, X) {
  return new Promise((resolve, reject) => {
    var scores = [];
    firebaseDb
      .collection(category)
      .orderBy("score", "desc")
      .limit(X)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          scores.push(`${data.score}, ${data.name}`);
        });
        resolve(scores);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function updateFirebaseProperty(firebase, collectionName, documentId, propertyName, newValue, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(documentId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dataToUpdate = {};
          dataToUpdate[propertyName] = newValue;

          // Update the specified property in Firestore.
          userRef
            .update(dataToUpdate)
            .then(() => {
              console.log(`${propertyName} updated to ${newValue}`);
              // You can also update the user interface with the new property value here.
              callback(null);
            })
            .catch((error) => {
              console.error(`Error updating ${propertyName}: ${error}`);
              callback(error);
            });
        } else {
          callback(new Error("User document not found"), null);
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
        callback(error);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"));
  }
}

// Function to read data from Firestore (e.g., logins count) for the currently authenticated user.
export function readUserDataFromFirestore(firebase, collectionName, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(user.uid);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          callback(null, userData);
        } else {
          callback(new Error("User data not found"), null);
        }
      })
      .catch((error) => {
        callback(error, null);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"), null);
  }
}

// Increments a numeric property in Firestore for the currently authenticated user.
function incrementFirebaseProperty(firebase, collectionName, documentId, propertyName, incrementBy, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(documentId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const currentValue = doc.data()[propertyName] || 0;
          const newValue = currentValue + incrementBy;

          // Update the specified property in Firestore.
          const dataToUpdate = {};
          dataToUpdate[propertyName] = newValue;

          userRef
            .update(dataToUpdate)
            .then(() => {
              console.log(`${propertyName} incremented by ${incrementBy} to ${newValue}`);
              // You can also update the user interface with the new property value here.
              callback(null, newValue);
            })
            .catch((error) => {
              console.error(`Error updating ${propertyName}: ${error}`);
              callback(error, null);
            });
        } else {
          // User document doesn't exist; create it and set the property to the increment value.
          const dataToCreate = {};
          dataToCreate[propertyName] = incrementBy;

          userRef
            .set(dataToCreate)
            .then(() => {
              console.log(`User document created with ${propertyName} set to ${incrementBy}`);
              // You can also update the user interface with the new property value here.
              callback(null, incrementBy);
            })
            .catch((error) => {
              console.error(`Error creating user document: ${error}`);
              callback(error, null);
            });
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
        callback(error, null);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"), null);
  }
}

export function getFirebaseProperty(firebase, collectionName, documentId, propertyName, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(documentId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const currentValue = doc.data()[propertyName] || 0;
          callback(null, currentValue);
        } else {
          // User document doesn't exist; create it and set the property to 0.
          const dataToCreate = {};
          dataToCreate[propertyName] = 0;

          userRef
            .set(dataToCreate)
            .then(() => {
              console.log(`User document created with ${propertyName} set to ${incrementBy}`);
              // You can also update the user interface with the new property value here.
              callback(null, incrementBy);
            })
            .catch((error) => {
              console.error(`Error creating user document: ${error}`);
              callback(error, null);
            });
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
        callback(error, null);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"), null);
  }
}

function incrementFirebaseLoginsValue(firebase) {
  const user = firebase.auth().currentUser;
  incrementFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.LOGINS, 1, (error, newValue) => {
    if (error) {
      console.error(`Error incrementing logins count: ${error}`);
    } else {
      console.log(`Logins count incremented to ${newValue}`);
      // You can also update the user interface with the new logins count here.
    }
  });
}

function incrementFirebaseScoreValue(firebase, incrementBy) {
  const user = firebase.auth().currentUser;
  incrementFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, "score", incrementBy, (error, newValue) => {
    if (error) {
      console.error(`Error incrementing score count: ${error}`);
    } else {
      console.log(`Logins count incremented to ${newValue}`);
      // You can also update the user interface with the new score total here
    }
  });
}

export function incrementFirebaseGivenPropertyValue(firebase, property, incrementBy) {
  const user = firebase.auth().currentUser;
  incrementFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, property, incrementBy, (error, newValue) => {
    if (error) {
      console.error(`Error incrementing ${property} count: ${error}`);
    } else {
      console.log(`${property} count incremented to ${newValue}`);
      //in future might want to be more specific about what to update
      updateAchievements();
    }
  });
}

export function updateAchievements() {
  let firebase = getFirebase();
  if (firebase) {
    const user = firebase.auth().currentUser;
    if (user) {
      getFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.KILLS, (error, value) => {
        if (error) {
          console.error(`Error getting ${property} count: ${error}`);
        } else {
          allTimeKills = value;
        }
      });
      getFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.SCORE, (error, value) => {
        if (error) {
          console.error(`Error getting ${property} count: ${error}`);
        } else {
          allTimePoints = value * 100;
        }
      });
      getFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.LOGINS, (error, value) => {
        if (error) {
          console.error(`Error getting ${property} count: ${error}`);
        } else {
          allTimeLogins = value;
        }
      });
    }
  }
}
