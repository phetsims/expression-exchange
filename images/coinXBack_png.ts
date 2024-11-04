/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;