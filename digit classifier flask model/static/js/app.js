Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drag and drop an image here, or click to select a file",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function(file) {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);        
        }
        classifyImage(file);
    });

    function classifyImage(file) {
        let reader = new FileReader();
        reader.onload = function(event) {
            let imageData = event.target.result;
            
            // Automatically capture the base URL
            var url = `${window.location.origin}/classify_image`;

            $.post(url, {
                image_data: imageData
            }, function(data, status) {
                console.log(data);
                if (!data || data.length == 0) {
                    $("#resultHolder").hide();
                    $("#divClassTable").hide();                
                    $("#error").show();
                    return;
                }
                let players = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
                
                let match = null;
                let bestScore = -1;
                for (let i = 0; i < data.length; ++i) {
                    let maxScoreForThisClass = Math.max(...data[i].class_probability);
                    if (maxScoreForThisClass > bestScore) {
                        match = data[i];
                        bestScore = maxScoreForThisClass;
                    }
                }
                if (match) {
                    $("#error").hide();
                    $("#resultHolder").show();
                    $("#divClassTable").show();
                    $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                    let classDictionary = match.class_dictionary;
                    for (let digits in classDictionary) {
                        let index = classDictionary[digits];
                        let probabilityScore = match.class_probability[index];
                        let elementName = "#" + digits;
                        $(elementName).html(probabilityScore);
                    }
                }
            });
        };
        reader.readAsDataURL(file);
    }
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});
