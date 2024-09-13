import { Human } from '../dist/human.esm.js';

// Configuration for Human library
const userConfig = {
  backend: 'webgl',
  async: true,
  warmup: 'none',
  cacheSensitivity: 0.01,
  debug: true,
  modelBasePath: '../models/',
  deallocate: true,
  face: {
    enabled: true,
    description: { enabled: true },
  },
};

const human = new Human(userConfig);

// Load image and return Image object
async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Get face embedding from an image URL
async function getFaceEmbedding(imageUrl) {
  const img = await loadImage(imageUrl);
  const result = await human.detect(img, userConfig);
  if (result && result.face && result.face.length > 0) {
    return result.face[0].embedding;
  } else {
    throw new Error('No face detected');
  }
}

// Match two photos using human.match.find
async function matchPhotos(photoUrl1, photoUrl2) {
  try {
    // Get embeddings for the two photos
    const embedding1 = await getFaceEmbedding(photoUrl1);
    const embedding2 = await getFaceEmbedding(photoUrl2);

    // Create a temporary "database" with one face entry
    const tempDB = [{ name: 'photo2', embedding: embedding2 }];

    // Perform the match using human.match.find
    const result = await human.match.similarity(embedding1, embedding2, { order: 2 });
    console.log('embedding1: ',embedding1);
    console.log('embedding2: ',embedding2);
    const percentageValue = (result * 100).toFixed(2);
    //const similarity = result && result.index >= 0 ? result.similarity : null;
    displayResults(photoUrl1, photoUrl2, percentageValue);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Display results in the HTML
function displayResults(photoUrl1, photoUrl2, similarity) {
  const imagesContainer = document.getElementById('images');
  const resultContainer = document.getElementById('result');

  // Create and display image elements
  const img1 = document.createElement('img');
  img1.src = photoUrl1;
  img1.className = 'image';
  const img2 = document.createElement('img');
  img2.src = photoUrl2;
  img2.className = 'image';

  imagesContainer.innerHTML = ''; // Clear previous results
  imagesContainer.appendChild(img1);
  imagesContainer.appendChild(img2);

  // Display similarity score
  if (similarity !== null) {
    const percentage = similarity;
    resultContainer.textContent = `Similarity: ${percentage}%`;
  } else {
    resultContainer.textContent = 'No match found';
  }
}

// Example usage
const photoUrl1 = '../ron01.png';
const photoUrl2 = '../ron02.png';

//const photoUrl1 = '../mess01.png';
//const photoUrl2 = '../mess02.png';

//const photoUrl1 = '../ron01.png';
//const photoUrl2 = '../mess01.png';

//const photoUrl1 = '../mess01.png';
//const photoUrl2 = '../mess01.png';

matchPhotos(photoUrl1, photoUrl2);
