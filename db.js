let firebaseConfig = {
    apiKey: "AIzaSyAKNQY57EwlQ6TAf13wSx4eba4NK-MAN88",
    authDomain: "p2p-game-test.firebaseapp.com",
    projectId: "p2p-game-test",
    storageBucket: "p2p-game-test.appspot.com",
    messagingSenderId: "849363353418",
    appId: "1:849363353418:web:13c04c4ac2ef99c88b4bb3",
  };
  firebase.initializeApp(firebaseConfig);
  
  let db = firebase.firestore();

  export function addScore(category, name, score) {
    var collection = db.collection(category);
  
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
      db.collection(category)
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
  