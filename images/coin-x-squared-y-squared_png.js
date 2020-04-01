/* eslint-disable */
const img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
