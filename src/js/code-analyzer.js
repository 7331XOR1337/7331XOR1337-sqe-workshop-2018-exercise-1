import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

export function CreateRecords(codeToParse) {
    let parsedCode = parseCode(codeToParse);
    let records = [];
    parsedCode.body.forEach(node => {
        records = records.concat(parseNodeByType(node));
    });
    return records;
}

const HandlerFunctionDictionary = {
    'FunctionDeclaration': FunctionDeclarationHandlerFunction,
    // 'VariableDeclarator': VariableDeclaratorHandlerFunction,
    'WhileStatement': WhileStatementHandlerFunction, /* while(){}*/
    'IfStatement': IfStatementHandlerFunction, /*if(){}*/
    // 'ElseIfStatement': ElseIfStatementHandlerFunction, /*else if*/ managed by IfStatementHandlerFunction
    'ReturnStatement': ReturnStatementHandlerFunction, /*return */
    'ForStatement': ForStatementHandlerFunction, /* for (){}*/
    'AssignmentExpression': AssignmentExpressionHandlerFunction,
    'BinaryExpression': BinaryExpressionHandlerFunction,
    'MemberExpression': MemberExpressionHandlerFunction,
    'UnaryExpression': UnaryExpressionHandlerFunction,
    'Literal': LiteralHandlerFunction,
    'Identifier': IdentifierHandlerFunction,
    'UpdateExpression': UpdateExpressionHandlerFunction,
    // 'CallExpression': CallExpressionHandlerFunction, /* */
    // 'ArrayExpression': ArrayExpressionHandlerFunction, /* let a = []; */
    'VariableDeclaration': VariableDeclarationHandlerFunction, /* let a */
    'ExpressionStatement': ExpressionStatementHandlerFunction, /* */
    'BlockStatement': BlockStatementHandlerFunction,
    'Program': BlockStatementHandlerFunction,
};

function createNewDataRecord(inputLine, inputType, inputName, inputCondition, inputValue) {
    return {line: inputLine, type: inputType, name: inputName, condition: inputCondition, value: inputValue};
}

export function parseNodeByType(node) {
    return HandlerFunctionDictionary[node.type](node);
}

function VariableDeclarationHandlerFunction(node) {
    let records = [];
    node.declarations.forEach(declaration => {
        let variableValue = 'null (or nothing)';

        /* In case we have a value */
        if (null !== declaration.init) {
            variableValue = parseNodeByType(declaration.init);
        }
        records.push(createNewDataRecord(declaration.loc.start.line, 'variable declaration', declaration.id.name, '', variableValue));
    });
    return records;
}

function ExpressionStatementHandlerFunction(node) {
    if ('AssignmentExpression' === node.expression.type) {
        return AssignmentExpressionHandlerFunction(node.expression);
    }
}

function VariableDeclarationForParameters(node) {
    return createNewDataRecord(node.loc.start.line, 'variable declaration', node.name, '', '');
}

function FunctionDeclarationHandlerFunction(node) {
    let records = [];
    records.push(createNewDataRecord(node.loc.start.line, 'function declaration', node.id.name, '', ''));
    node.params.forEach(nodeVar => {
        records.push(VariableDeclarationForParameters(nodeVar));
    });
    records = records.concat(parseNodeByType(node.body));
    return records;
}

function BlockStatementHandlerFunction(node) {
    let records = [];
    node.body.forEach(bodyNode => {
        records = records.concat(parseNodeByType(bodyNode));
    });
    return records;
}

function WhileStatementHandlerFunction(node) {
    let records = [];
    records.push(createNewDataRecord(node.loc.start.line, 'while statement', '', parseNodeByType(node.test), ''));
    records = records.concat(parseNodeByType(node.body));
    return records;
}

function IfStatementHandlerFunction(node, type = 'if statement') {
    let records = [];
    records.push(createNewDataRecord(node.loc.start.line, type, '', parseNodeByType(node.test), ''));
    records = records.concat(parseNodeByType(node.consequent));
    if (null != node.alternate && undefined !== node.alternate) {
        if ('IfStatement' === node.alternate.type) {
            records = records.concat(IfStatementHandlerFunction(node.alternate, 'else if statement'));
        }
        else {
            records = records.concat(parseNodeByType(node.alternate));
        }
    }
    return records;
}

function ReturnStatementHandlerFunction(node) {
    return createNewDataRecord(node.loc.start.line, 'return statement', '', '', parseNodeByType(node.argument));
}

function ForStatementHandlerFunction(node) {
    let records = [];
    records.push(createNewDataRecord(node.loc.start.line, 'for statement', '', parseNodeByType(node.test), ''));
    records = records.concat(parseNodeByType(node.init));
    records.push(parseNodeByType(node.update));
    records = records.concat(parseNodeByType(node.body));
    return records;
}

function BinaryExpressionHandlerFunction(node) {
    let operator = node.operator;
    let leftSide = parseNodeByType(node.left);
    let rightSide = parseNodeByType(node.right);
    return leftSide + ' ' + operator + ' ' + rightSide;
}

function MemberExpressionHandlerFunction(node) {
    let member = node.object.name;
    let memberIndex = parseNodeByType(node.property);
    return member + '[' + memberIndex + ']';
}

function UnaryExpressionHandlerFunction(node) {
    let operator = node.operator;
    let argument = parseNodeByType(node.argument);
    return operator + argument;
}

function AssignmentExpressionHandlerFunction(node) {
    return createNewDataRecord(node.loc.start.line, 'assignment expression', parseNodeByType(node.left), '', parseNodeByType(node.right));
}

function LiteralHandlerFunction(node) {
    return node.value;
}

function IdentifierHandlerFunction(node) {
    return node.name;
}

function UpdateExpressionHandlerFunction(node) {
    let operator = node.operator;
    let argument = parseNodeByType(node.argument);
    return createNewDataRecord(node.loc.start.line, 'update expression', '', '', argument + operator);
}

export {parseCode};