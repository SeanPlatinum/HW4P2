/*
Sean Diaz 6/10/24
HW4 P2 Wenjin Zhou GUI PROGRAMMING

This was so difficult thank you for extending the due date as many times as you did, I notice now 
that a lot of this code may be redundant...however as for now it works which is all I can say 
it also isn't very aesthetic...

Ultimately I learned a ton about jquery. I honestly thought about giving up if it werent for the extension 
because work was getting in the way and I clearly needed more time. 
I learned so much about how to get and manipulate values in JS and how certain packages like 
jquery make things easier or harder but more aesthetically pleasing. I couldn't imagine making my own tabbing 
system. 

Thanks so much for the extension again!
~Sean
*/ 
//some stuff I used other than assignment gave us..
//https://www.w3schools.com/js/js_this.asp
//https://stackoverflow.com/questions/15060292/a-simple-jquery-form-validation-script
//https://stackoverflow.com/questions/35186991/jquery-ui-slider-setting-from-text-input
$(document).ready(function() {
    // Initialize sliders
    initializeSliders();

    // Initialize tabs with close button
    $("#tabs").tabs();

    // Update sliders when input fields change so that we satisfy rubric
    $("#start_Row, #end_Row, #start_Col, #end_Col").on("input change", function() {
        var sliderId = '#' + $(this).attr('id') + '_slider';
        var slider = $(sliderId);
        slider.slider("value", $(this).val());
        $(this).valid();  // Validate the field on change
        updateTable();
    });

    // Add custom validation method for checks for rows maybe can be redundant but it seems to be our easiest option.
    $.validator.addMethod("CheckRow", function(value, element) {
        var start_Row = parseInt($('#start_Row').val());
        var end_Row = parseInt($('#end_Row').val());

        if (isNaN(start_Row) || isNaN(end_Row)) {
            return true; // skip this check if any value is not a number
        }

        return start_Row <= end_Row;
    }, "Start row must be less than or equal to end row.");
    //Sean Fix this because clearly the validation stops working here, the text never goes away :(
    // Add custom validation method for checks for columns
    $.validator.addMethod("CheckCol", function(value, element) {
        var start_Col = parseInt($('#start_Col').val());
        var end_Col = parseInt($('#end_Col').val());

        if (isNaN(start_Col) || isNaN(end_Col)) {
            return true; // skip this check if any value is not a number
        }

        return start_Col <= end_Col;
    }, "Start column must be less than or equal to end column.");

    // Initialize form validation and handle form submission remember its dynamic 
    $("#tableForm").validate({
        onkeyup: function(element) {
            $(element).valid();
            if ($("#tableForm").valid()) {
                $("#notification").text(""); // Clear the notification if form is valid -test first
            }
        },
        rules: {
            start_Row: {
                required: true,
                number: true,
                range: [-50, 50],
                CheckRow: true
            },
            end_Row: {
                required: true,
                number: true,
                range: [-50, 50],
                CheckRow: true
            },
            start_Col: {
                required: true,
                number: true,
                range: [-50, 50],
                CheckCol: true
            },
            end_Col: {
                required: true,
                number: true,
                range: [-50, 50],
                CheckCol: true
            }
        },
        messages: {
            start_Row: {
                required: "Please enter a start row value.",
                number: "Please enter a valid number.",
                range: "Value must be between -50 and 50."
            },
            end_Row: {
                required: "Please enter an end row value.",
                number: "Please enter a valid number.",
                range: "Value must be between -50 and 50."
            },
            start_Col: {
                required: "Please enter a start column value.",
                number: "Please enter a valid number.",
                range: "Value must be between -50 and 50."
            },
            end_Col: {
                required: "Please enter an end column value.",
                number: "Please enter a valid number.",
                range: "Value must be between -50 and 50."
            }
        },
        errorPlacement: function(error, element) {
            error.insertAfter(element);
        },
        submitHandler: function(form) {
            const start_Row = parseInt($('#start_Row').val());
            const end_Row = parseInt($('#end_Row').val());
            const start_Col = parseInt($('#start_Col').val());
            const end_Col = parseInt($('#end_Col').val());
            createNewTabTable(start_Row, end_Row, start_Col, end_Col);
            $("#notification").text(""); // Clear the notification if form is valid
            return false; // Prevent default form submission to stop refreshing - START HERE TOMORROW
        },
        invalidHandler: function(event, validator) {
            // Display a notification or handle invalid form submission
            $("#notification").text("Please correct the errors and try again.");
        }
    });

    // Initial table generation for the first tab
    generateTable(parseInt($('#start_Row').val()), parseInt($('#end_Row').val()), parseInt($('#start_Col').val()), parseInt($('#end_Col').val()), 'tableContainer-1');

    // Bind event to close icon
    $("#tabs").on("click", ".ui-icon-close", function() {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        $("#tabs").tabs("refresh");
        updateTable(); // Ensure table updates dynamically after a tab is deleted
    });
});

let tabCounter = 1;

function initializeSliders() {
    $("#start_Row_slider").slider({ //make da actual slider
        min: -50, // we only need to go up to this...and -50
        max: 50,
        slide: function(event, ui) {
            $("#start_Row").val(ui.value).trigger("change"); //this should actually connects
        }
    });
    $("#end_Row_slider").slider({
        min: -50,
        max: 50,
        slide: function(event, ui) {
            $("#end_Row").val(ui.value).trigger("change");
        }
    });
    $("#start_Col_slider").slider({
        min: -50,
        max: 50,
        slide: function(event, ui) {
            $("#start_Col").val(ui.value).trigger("change");
        }
    });
    $("#end_Col_slider").slider({
        min: -50,
        max: 50,
        slide: function(event, ui) {
            $("#end_Col").val(ui.value).trigger("change");
        }
    });
}

function createNewTabTable(start_Row, end_Row, start_Col, end_Col) {
    tabCounter++;
    let newTabId = `tab-${tabCounter}`;
    let newTabTitle = `Table ${tabCounter} <span class='ui-icon ui-icon-close' role='presentation'></span>`;
    
    // Add new tab
    $("#tabs ul").append(`<li><a href="#${newTabId}">${newTabTitle}</a></li>`);
    $("#tabs").append(`<div id="${newTabId}"><div id="tableContainer-${tabCounter}" class="tableContainer"></div></div>`);
    $("#tabs").tabs("refresh");
    
    // Generate the table in the new tab
    generateTable(start_Row, end_Row, start_Col, end_Col, `tableContainer-${tabCounter}`);
    
    // Switch to the new tab
    $("#tabs").tabs("option", "active", $("#tabs ul li").length - 1);
}

function generateTable(start_Row, end_Row, start_Col, end_Col, containerId) {
    let tableContainer = document.getElementById(containerId);
    tableContainer.innerHTML = '';  // Clear previous table if any

    let table = document.createElement('table');
    let table_body = document.createElement('tbody'); 
    let table_head = document.createElement('thead'); 
    let headerRow = document.createElement('tr'); 
    let emptyHeader = document.createElement('th'); 
    headerRow.appendChild(emptyHeader);

    for (let col = start_Col; col <= end_Col; col++) {
        let th = document.createElement('th');
        th.innerText = col;
        headerRow.appendChild(th);
    }
    table_head.appendChild(headerRow);

    // Create table rows
    for (let row = start_Row; row <= end_Row; row++) { 
        let tr = document.createElement('tr');
        let th = document.createElement('th'); 
        th.innerText = row;
        tr.appendChild(th);
        for (let col = start_Col; col <= end_Col; col++) {
            let td = document.createElement('td'); 
            td.innerText = row * col;
            tr.appendChild(td);
        }
        table_body.appendChild(tr);
    }

    table.appendChild(table_head);
    table.appendChild(table_body);
    tableContainer.appendChild(table);
}

function updateTable() {
    // Get the values of rows and such from the input field and convert it to an integer
    const start_Row = parseInt($('#start_Row').val());
    const end_Row = parseInt($('#end_Row').val());
    const start_Col = parseInt($('#start_Col').val());
    const end_Col = parseInt($('#end_Col').val());
    // Check if all the values are valid numbers this is easy because now we can just stop bad inputs...
    if (!isNaN(start_Row) && !isNaN(end_Row) && !isNaN(start_Col) && !isNaN(end_Col)) {
        // Get the active tab
        let activeTabIndex = $("#tabs").tabs("option", "active"); //option lets you get or set options for the tabs I made
        let TabId = $("#tabs .ui-tabs-panel").eq(activeTabIndex).attr("id");
        let containerId = `tableContainer-${TabId.split('-')[1]}`;//This splits the TabId string into parts and constructs the container ID.
        //This is the hardest thing ive had to solve, split...  Takes the second part, which is '2'. Template Literal: Combines this part with tableContainer- to form tableContainer-2.
        generateTable(start_Row, end_Row, start_Col, end_Col, containerId);
        // container ID as the fourth argument to specify where to generate the table :)))) (Sean come back if still bug 6/15)
    }
}
