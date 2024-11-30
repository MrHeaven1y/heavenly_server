Dropzone.autoDiscover = false;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Drop image here or click to upload",
    autoProcessQueue: false,
  });

  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
  });

  $("#submitBtn").on("click", function () {
    if (dz.files.length === 0) {
      alert("Please upload an image first.");
      return;
    }

    let file = dz.files[0];
    let reader = new FileReader();

    reader.onload = function (event) {
      let imageData = event.target.result;

      // Post data to server
      var url = "/classify_image";
      $.post(url, { image_data: imageData }, function (data, status) {
        console.log("Received data:", data);
        
        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#error").show();
          return;
        }

        // Access the first (and likely only) result
        let result = data[0];
        
        // Display the predicted class
        $("#resultHolder").html(`<h2>Classified as: ${result.class}</h2>`);
        
        // Display probabilities
        $("#yes").text((result.class_probability[1] * 100).toFixed(2) + "%");
        $("#no").text((result.class_probability[0] * 100).toFixed(2) + "%");

        // Show result sections
        $("#error").hide();
        $("#resultHolder").show();
        $("#divClassTable").show();

      }).fail(function (xhr, status, error) {
        console.error("Error:", error);
        $("#error").show();
        $("#resultHolder").hide();
        $("#divClassTable").hide();
      });
    };

    reader.readAsDataURL(file);
  });
}

$(document).ready(function () {
  console.log("ready!");
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();
  init();
});