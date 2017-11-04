var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var fs = require('fs');

const userData  = JSON.parse(fs.readFileSync('mockdata/user.json', 'utf8'));
const todoData  = JSON.parse(fs.readFileSync('mockdata/todo.json', 'utf8'));

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
            userTodoObj.todo = [];
            for(let j=0; j < todoData.length; i++){
                if(todoData[j].userid == userData[i].id){
                    userTodoObj.todo.push(todoData[j]);
                }
            }
            userTodosArr.push(userTodoObj);
        }

        return userTodosArr;
    },

    getActiveTodoForUser:(args) =>{
        let todoArrs = [];
        for (let i = 0; i < userData.length; i++) {
            if (userData[i].id == args.id) {
                continue;
            }

            for (let j = 0; j < todoData.length; i++) {
                if (todoData[j].userid == userData[i].id && todoData[i].done) {
                    todoArrs.push(todoData[j]);
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