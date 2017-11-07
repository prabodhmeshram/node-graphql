var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var fs = require('fs');

const userData  = JSON.parse(fs.readFileSync('mockdata/user.json', 'utf8'));
const todoData  = JSON.parse(fs.readFileSync('mockdata/todo.json', 'utf8'));
const MONTHMAP = {
    "JAN" : 0,
    "FEB" : 1,
    "MAR" : 2,
    "APR" : 3,
    "MAY" : 4,
    "JUN" : 5,
    "JUL" : 6,
    "AUG" : 7,
    "SEP" : 8,
    "OCT" : 9,
    "NOV" : 10,
    "DEC" : 11
};

var schema = buildSchema(`
  type Query {
    getUserForId(id: ID!): User,
    getTodoForId(id: ID!): Todo,
    getAllActiveUsersAndTheirTodos: [UserTodo],
    getActiveTodoForUser(id :ID!): [Todo]
  }

  type User {
      id : ID!,
    fName: String,
    lName: String,
    email: String,
    pinCode: Int,
    birthDate : String,
    isActive : Boolean
  }
  
  type Todo {
      id: ID!,
      userid: String,
      text: String,
      done: Boolean,
      targetDate: String
  }

  type UserTodo {
      user : User,
      todos : [Todo]
  }
`);

var root = { 
    getUserForId: (args) => {
        for(let i=0; i < userData.length; i++){
            if(userData[i].id == args.id){
                return userData[i];
            }
        }
    },
    
    getTodoForId:(args) =>{
        for(let i=0; i < todoData.length; i++){
            if(todoData[i].id == args.id){
                return todoData[i];
            }
        }
    },

    //Not Working...
    getAllActiveUsersAndTheirTodos:(args) =>{
        let userTodosArr = [];
        for(let i=0; i< userData.length; i++){
            if(!userData[i].isActive){
                continue;
            }
            let userTodoObj = {};
            userTodoObj.user = userData[i];
            userTodoObj.todos = [];
            for(let j=0; j < todoData.length; j++){
                if(todoData[j].userid == userData[i].id){
                    userTodoObj.todos.push(todoData[j]);
                }
            }
            userTodosArr.push(userTodoObj);
        }

        return userTodosArr;
    },

    //Not Working...
    getActiveTodoForUser:(args) =>{
        let todoArrs = [];
        for (let i = 0; i < userData.length; i++) {

            if (userData[i].id != args.id) {
                continue;
            }

            for (let j = 0; j < todoData.length; j++) {
                if (todoData[j].userid == userData[i].id && todoData[j].done) {
                    let dateFragments = todoData[j].targetDate.split("-");

                    let date = new Date(dateFragments[2], MONTHMAP[dateFragments[1]],dateFragments[0]);
                    let currentDate = new Date();
                    var tomorrow = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
                    if(
                        (
                            date.getFullYear() == currentDate.getFullYear() 
                            && date.getMonth() == currentDate.getMonth()
                            && date.getDate() == currentDate.getDate()
                        ) || 
                        (
                            date.getFullYear() == tomorrow.getFullYear() 
                            && date.getMonth() == tomorrow.getMonth()
                            && date.getDate() == tomorrow.getDate()
                        )
                        )
                    {
                            todoArrs.push(todoData[j]);
                    }
                }
            }
        }
        return todoArrs;
    }
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));


app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));