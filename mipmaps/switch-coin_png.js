/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
const mipmaps = [
  {
    "width": 117,
    "height": 117,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 59,
    "height": 59,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 30,
    "height": 30,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAklEQVR4AewaftIAAAUdSURBVLXBXYhcVwHA8f855869d+bO13bM7Ga3MdHYVqkpsoqIhiYqhTaaF/sivuRBXNKmL30U2i7pgx/gQxGXyiLKIopIHyoLvggm6LNBupWaZklC2u1+z87szJ37fY43sAvjuruZLfH3EwxhbmbyOeC7ZSd9ouxmxwsqc4WgoI3oh7Hy2/3CnVTLv4P5+aUrN7oMQXCIuZnJF8pO9oNmLXzqEa+vXDthP1pLtgOXzW6xtbLt/MUYXrl05cYihxDsY25m8jOOZd480fC/0ax1pRSGYQWxzb2N6vp613nj0pV//IgDKPaYm5l8tl5K//i5idZk3QuEEBxJQWU0yoHnWJw/9/TJJ9/+8/Jb7EMxYG5m8plGOf7tZ8c3J2wr4+MSAspuJCtu9uTZr546/9xXjv1u/vqaZoBkx9zMZLNWTN98bGyrqaTmYRgp93lsonfeqlhvs4dkhxJm9vRo57SlMh6mZq3L+LH4wq9+8oUfM0CSm5v54vMnGsGzJSdiGMYIwsii17fx+zZxojjMp5pt4ZS4PPv6mUl2WORspS+P1bsOhzBG0OsXaHds4kTiOpqCpTEIosghSQWNkZhaJUIIwyBLZZxohvVbPfcV4Dvk1NzMZHOsHv20Uek7HKAfFPhwuYQxksZIRLMRUC3HeKWEcimhVo2pVhI6XZutbZuKlyAE/6VoZyxteuPfOnvs1/PX1nwJ4vt1L6xygFbbZXXDZWIs4HjTx3VS9mMpzfGmT8VL+XDFwxjBINtKqFfSGogXyUngSxU3Yj+tjovftzg50cOxU4YxUgspWIb2tsNe9WpK7mvkZMlJG5bK2CsIC3S2C0yM+UhpOIpmI6DVttFGMKhopwglTpKTjtTH2MMYwfKay/hogJSGo1JK45VS+kGBQZbSIPDISW0osUfPtym6GsdOeRBjBEFYQGvJIMfWJInkfwmPnBXGUrPHVsdm9BMBD2KM4N5HHiBIEsGnP9lFSsNBUi0x2qTkZBCrjSyT7NJakmYCx0l5kChWKAWOrUlSiTGCXUGocOyMQWFkQWb65CydmLVe6FLz+twXRopSMWMYQhiMhmazT6MuUUpzXxhZhJGk6KYM6vQscuvkZBZk/9zsuuyKYoVjZwzDsTMyLej6NpalSVNJq+2ytFJiYjRACMOuJLVotRVg3icnMfxyecP2My25z7EzSm7KsE4c9+kHFnc+qLC04qG14NSjPRwnZdD6tkcaGRDiT+TU/LXV7oWnR59xiupUtRRRKGgsSzMsKQ0VL2GkFlGvxpSKKVIaBqWZ4l93q6SB+ffU9DsvkJPkTGp+cWepmISxzf/DvY0qQdeQ+wM7FLn5a6vvXTjb/LKfuY836wFSGB6WVtfj5u0SJjE3pqbf+R47JLsMl7fWxd2bS4+gteRh6PSLvHu7go71FsL8kAGKHfPXVrsXzzVv93z1TT8reiPlGCU1H9f6dpl3F6skftYHXp2aXvg9AxQD5q+vvX/x3Oitvi/OrftexXWgZCcIwdDi1GJxeYTFu0WyMOsAV6emF95gD8Ue89dXb178evNvaWjOrLWcR9tBCWkp3EKKlIb9GCPwQ5cPNqu8d6dCe0NAqm8ieGlqeuE37ENwiNmrZ14FcUkocVo6gmo5o1LS2LZGSUOcSIJI0ukqolCgY01uBWPeAl6eml5IOYBgCLOvP3UFw7fBPIFgHHDYZUhBrCK4heGvCPOzqdcWAh5AcESzV89YID6PMA2gCyxOvbbQ4oj+A3KPLLdxCCEmAAAAAElFTkSuQmCC"
  },
  {
    "width": 15,
    "height": 15,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAklEQVR4AewaftIAAAIlSURBVIXBy0tUYRgH4N/7fefMmfulM6hBSUjtVMiQpHAVhP9BBEWbmKCWtYmioTa1qo1DICUI4SqsdvUHSEtDSRC6EVF4neNcnHP7vrczMtIwCD0PoctcZezsQM69U0h5Z0ypiyAWSola0zNXf2wlZ6/dWppHF0LHm9nR+4N243YuuZcnYvRqunH/dzW9MHX182V0SEQWXo7ePTXglDOJVooIh4oZocwmveGpC4Pn5t9tvkJEzlXGhk/212eyyVYGXZgJYSihWUAKRpsUjFRcDU2Mnyi8/bD+Xl6/ZD8+bu+eJ8I+pQScWhyuZwAghKFAvWFBCMAwNExDUahiQ5Onjz43ihl3nIjRFoQSTi0GO+9BCI0DGQA7TgJSapiGQi7t9wHGTWFKXUSEmeDULBQLLoTQ6FXIuag3YmhLWAEgaVSEihKI7LVMZFIBiBgHmAk7TgJ7LRNEDCLGP5QUfiBriHi+RNwK0E0pgtIErQW0FmDGPtc3gVA7YqNqfWcmmIZGL8PQEMQIAoHqroV81kfbZjWGyKKxvU2vN+z0ZH+hLnAIu9BCt5Zn4c+6+bVUXp4VpXvL019+Jhebbhz/EyqJ1W/ZQPlcQUQg4jb4xqe17OrWbhrMhMM0XQtLa0dCZ4delMorzxAhdMw8GjkGQdOFvL7YZ3uJVEJBEKPlSWxXY1jfMn5xyJVSeeUJOgg9Zh6OTAC4AuAkCCYYNQAfQXhaerASostfrwPholr9oLMAAAAASUVORK5CYII="
  },
  {
    "width": 8,
    "height": 8,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAklEQVR4AewaftIAAADvSURBVC3BvS9DURgH4N973nt6nSNupVESezcSFjFgl5iQzqYONoOVsEpsli5iM9zdLuEf6EgsTV1JRSRa9/u87k08D6HyHHau50zSZeXaTtT3JPYfNg9ej1Dhp7Bz1Q5+TnxdNBWBPS5nrZ+tdfeW12/Dr3svMMkhkajpbwPMAhGACAhsttu/XNnxFMlinGhYk6OWZQwnBF/nDbDaUlnBE1YCIkFtGms4R4hTDRQyUh+f5lFrhxqRoDUfw5oc0di89M4Hd95wqI/Lsrmw1Eq3rck5ST28j2feokifokL4179Y3QewAWAEwk3vbOBQ+QNhv1fW2OwBwAAAAABJRU5ErkJggg=="
  }
];
mipmaps.forEach( mipmap => {
  mipmap.img = new Image();
  const unlock = simLauncher.createLock( mipmap.img );
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement( 'canvas' );
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext( '2d' );
  mipmap.updateCanvas = () => {
    if ( mipmap.img.complete && ( typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0 ) ) {
      context.drawImage( mipmap.img, 0, 0 );
      delete mipmap.updateCanvas;
    }
  };
} );
export default mipmaps;