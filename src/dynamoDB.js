'use strict'

var AWS = require("aws-sdk");
var skill = require('index');
var dynamoDBTableName = 'OneShotPrototype';
var docClient = AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

function putUserState (session, callback) {
    var params = {
        "TableName": dynamoDBTableName,
        "Item": {
            "userId": session.user.userId,
            "breadcrumbs": session.attributes.breadcrumbs,
            "currentSceneId": session.attributes.currentSceneId
        }
    }
}