const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testNewUpload() {
  try {
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const testImageData = Buffer.from('fake-image-data-for-testing');
    fs.writeFileSync(testImagePath, testImageData);
    
    // Create form data for new material upload
    const form = new FormData();
    form.append('title', 'Test Item - New Format');
    form.append('category', 'Book');
    form.append('course', 'CSE');
    form.append('semester', '3');
    form.append('condition', 'Good');
    form.append('type', 'For Sale');
    form.append('price', '100');
    form.append('owner', 'Test User');
    form.append('ownerContact', 'test@example.com');
    form.append('description', 'Testing new image format');
    form.append('image', fs.createReadStream(testImagePath), 'test-image.jpg');
    
    // Submit the form
    const response = await fetch('http://localhost:5000/api/materials', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('New item created successfully:', JSON.stringify(result, null, 2));
    } else {
      console.error('Upload failed:', response.status, response.statusText);
    }
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testNewUpload();
