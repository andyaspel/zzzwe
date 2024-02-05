// Create a font object from a bit-font map image
function createFont(image, charWidth, charHeight) {
  // Assume the image contains 16 x 16 characters
  var cols = 16;
  var rows = 16;
  // Create a mapping of characters to their positions in the image
  var map = {};
  // The first 32 characters are control codes, so skip them
  var index = 32;
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      // Get the character from the ASCII code
      var char = String.fromCharCode(index);
      // Store the position of the character in the image
      map[char] = {x: x * charWidth, y: y * charHeight};
      // Increment the index
      index++;
    }
  }
  // Return the font object
  return {image: image, charWidth: charWidth, charHeight: charHeight, map: map};
}

// Draw text on the canvas using a font object
function drawText(font, text, x, y, ctx) {
  // Loop through the characters of the text
  for (var i = 0; i < text.length; i++) {
    // Get the character
    var char = text[i];
    // Get the position of the character in the image
    var pos = font.map[char];
    // If the character is not in the image, skip it
    if (!pos) continue;
    // Copy the character from the image to the canvas
    ctx.drawImage(font.image, pos.x, pos.y, font.charWidth, font.charHeight, x, y, font.charWidth, font.charHeight);
    // Increment the x coordinate by the character width
    x += font.charWidth;
  }
}

// Get the canvas element and the context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Load the bit-font map image
var image = new Image();
image.src = "bitfont.png"; // Replace with your image URL
image.onload = function() {
  // Create a font object from the image
  var font = createFont(image, 8, 8); // Adjust the character width and height as needed
  // Draw some text on the canvas using the font object
  drawText(font, "Hello, world!", 10, 10, ctx);
  drawText(font, "This is a bit-font map.", 10, 30, ctx);
};
