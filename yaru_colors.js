yaru_colors = {
	"Yaru-Amber": "eea834",
  "Yaru-Aqua": "41c6c8",
  "Yaru-Aubergine": "77216F",
  "Yaru-Blue": "77216F",
  "Yaru-Brown": "995640",
  "Yaru-Cinnamon": "995640",
  "Yaru-Deepblue": "25469d",
  "Yaru-Green": "25469d",
  "Yaru-Grey": "9c9c9c",
  "Yaru-Lavender": "6a39cb",
  "Yaru-Mate": "78ab50",
  "Yaru-Orange": "e920a3",
  "Yaru-Purple": "924d8b",
  "Yaru-Red": "924d8b",
  "Yaru-Teal": "16a085",
  "Yaru-Yellow": "e9ba20"
}

exports.matchColor = matchColor;

function matchColor(color_to_match) {
	let col1 = hexToRgb(color_to_match);
	let col2 = null;
	let diff = 1000;
  let diff_color = "";

	for (const [key, value] of Object.entries(yaru_colors)) {
	  col2 = hexToRgb(value);
  
  	let new_diff = colorDifference(col1[0], col1[1], col1[2], col2[0], col2[1], col2[2]);
    if(new_diff < diff) {
    	diff = new_diff;
      diff_color = key;
    }
	}
  
  return diff_color;
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function colorDifference (r1, g1, b1, r2, g2, b2) {
    var sumOfSquares = 0;

    sumOfSquares += Math.pow(r1 - r2, 2);
    sumOfSquares += Math.pow(g1 - g2, 2);
    sumOfSquares += Math.pow(b1 - b2, 2);
    
    return Math.sqrt(sumOfSquares);
}