// Test the image URL construction
const API_BASE = 'http://localhost:5000';

function getImageUrl(filename) {
  if (!filename) {
    return '/placeholder.png';
  }
  return `${API_BASE}/uploads/${filename}`;
}

function getLostFoundImageUrl(filename) {
  if (!filename) {
    return '/placeholder.png';
  }
  return `${API_BASE}/uploads/lostfound/${filename}`;
}

// Test with sample filenames from the database
console.log('Testing getImageUrl function:');
console.log('Filename: 1773510373391-33951326-kiran1.jpg');
console.log('URL:', getImageUrl('1773510373391-33951326-kiran1.jpg'));
console.log('');

console.log('Testing getLostFoundImageUrl function:');
console.log('Filename: 4969-54461558-favicon.png');
console.log('URL:', getLostFoundImageUrl('4969-54461558-favicon.png'));
console.log('');

console.log('Testing fallback:');
console.log('No filename provided:', getImageUrl());
console.log('No filename provided:', getLostFoundImageUrl());
