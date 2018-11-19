import $ from 'jquery';
import {CreateRecords} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let records = CreateRecords(codeToParse);
        $('#tableView').empty();
        makeTableHeaders();
        createTable(records);
    });
});

function makeTableHeaders() {
    let headersHTMLStr = '<tr>' + '<th> Line </th>' + '<th> Type </th>' + '<th> Name </th>' + '<th> Condition </th>' + '<th> Value </th>' + '</tr>';
    $('#tableView').append(headersHTMLStr);
}

function createTable(records) {
    records.forEach(record => {
        let recordsAsHTMLStr = '<tr>' + '<td>' + record.line + '</td>' + '<td>' + record.type + '</td>' + '<td>' + record.name + '</td>' + '<td>' + record.condition + '</td>' + '<td>' + record.value + '</td>' + '</tr>';
        $('#tableView').append(recordsAsHTMLStr);
    });
}

