/* global $, tasks */
$(document).ready(() => {
  $('#lapse-settings').submit((e) => {
    e.preventDefault();
    $.ajax({
      type: 'PUT',
      url: '/',
      data: {
        ip: $('#time-machine-ip').val(),
        fps: $('#time-machine-fps').val(),
        videoLength: $('#time-machine-video-length').val(),
      },
      success: (response) => {
        console.log('success!', response);
      },
    });
  });
});
