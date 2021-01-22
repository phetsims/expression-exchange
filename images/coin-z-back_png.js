/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;