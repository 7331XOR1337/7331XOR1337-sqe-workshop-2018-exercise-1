import assert from 'assert';
import {CreateRecords, parseCode} from '../src/js/code-analyzer';

/**********************************************************************************************************************/

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a","loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":5}}},"init":{"type":"Literal","value":1,"raw":"1","loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":9}}},"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":9}}}],"kind":"let","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}],"sourceType":"script","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}'
        );
    });
});

/**********************************************************************************************************************/
describe('Check function handlers', () => {
    it('Test function declaration ', () => {
        assert.equal(CreateRecords(
            'function foo1(param1, param2){\n }\n\n' +
            'function foo2(){\n    return "notImplemented"\n}\n\n' +
            'function foo3(a){\n    let localVar = 6;\n' +
            '    return localVar;\n}\n\n').length, 9);
    });

    it('Test given function binarySearch from sample', () => {
        assert.equal(CreateRecords('function binarySearch(X, V, n){\n' + 'let low, high, mid;\n' + 'low = 0;\n' + 'high = n - 1;\n' + 'while (low <= high) {\n' + 'mid = (low + high)/2;\n' + ' if (X < V[mid])\n' + 'high = mid - 1;\n' +
            '        else if (X > V[mid])\n' +
            '            low = mid + 1;\n' +
            '        else\n' +
            '            return mid;\n' +
            '    }\n' +
            '    return -1;\n' +
            '}').length, 17);
    });
});
/**********************************************************************************************************************/

describe('Check variables handlers', () => {
    it('Test variables initialization', () => {
        assert.equal(CreateRecords(
            'let username = rom6df, password = "hcx254v";\n' +
            'let country = "Spain";\n' +
            'let carManufacturer, carModel, carYear, carHands;\n').length, 7);
    });
    it('Test variable assignment', () => {
        assert.equal(CreateRecords(
            'let average = (90 + 100 + 50) / 3;\n' +
            'var balance = 12000000 - 50;\n' +
            'localUrl = globalUrlArray[2];\n' +
            'let myName = arr[1] + arr[2]').length, 4);
    });
});

/**********************************************************************************************************************/
describe('Check loops handlers', () => {
    it('Test for loop', () => {
        assert.equal(CreateRecords('let a = 6;\nfor(let i=0; i < 100; i++){\n    a = a * 3;\n}')[1]['condition'], 'i < 100');
    });
    it('Test while loop', () => {
        assert.equal(CreateRecords('var i = 6;\nwhile(i < 100){\n    i = i + 5;\n}')[1]['type'], 'while statement');
    });
});
/**********************************************************************************************************************/
describe('Check conditions handlers', () => {
    it('Test if statement', () => {
        assert.equal(CreateRecords(
            'if(high < low){\n    low = high + 1;\n}\n\n' +
            'if(max != min){\n    max = min;\n}')[2]['condition'], 'max != min');
    });
    it('Test if else if else statement', () => {
        assert.equal(CreateRecords(
            'let max = -1, x = 0, y = 2, z = 5;\n' +
            'if(z > x)\n' +
            '    max=1;\n' +
            'else if (y < 60)\n' +
            '    max = 2;\n' +
            'else\n' +
            '     max = 4').length, 9);
    });
});