/*
* Ramulator.js
* Emulates a random acces machine state by state.
*/

"use strict";


/*
* Registers are used to hold values and
* intermediate results.
*/
class Registers{

  // init register class with a set number of registers.
  constructor( num_registers ){
    this.content = new Array(num_registers);
    this.emptyRegisters();
    this.adjustTable();
  }

  //sets register contents back to null (init state)
  emptyRegisters(){
    for( var i = 0; i < this.content.length; i++ ){
      this.content[i] = null;
    }
  }

  //adjusts the displayed table size on the page to the ammount of registers.
  adjustTable(){
    $("#register-table").empty();
    for( var i = -1; i < this.content.length; i++ ){
      if(i == -1){
        $("#register-table").append("<tr class='warning shadow'><td><b>R</b></td><td><b>Value</b></td></tr>");
      }
      else{
        $("#register-table").append("<tr><td>R" + i + "</td><td>" + this.content[i] + "</td></tr>");
      }
    }
  }

  //resize the amount of registers available.
  adjustRegisters( num_registers ){
    this.content = new Array(num_registers);
    this.emptyRegisters();
    this.adjustTable();
  }

};

/*
* "Tokenizer" if you could call it that.
* Takes input code and splits it up in usable tokens.
*/
class Tokenizer{
  constructor(){
    this.tokens = new Array();
    this.labels = new Array();
  }
  tokenize(){
    //split on space (seperates instruction from operand and label) and newlines
    this.tokens = editor.getValue().split(/[\n ]/);
    this.labels = [];
    //take out labels and build jump table.
    for(var i = 0; i < this.tokens.length; i++){
      if(this.tokens[i].length >= 2 && this.tokens[i][0] == '"' && this.tokens[i][this.tokens[i].length-1] == '"' && this.tokens[i-1] != "JGTZ" && this.tokens[i-1] != "JUMP" ){
        this.labels.push( [this.tokens[i], i] );
        this.tokens.splice( i, 1 );
      }
    }

    // console.log(this.tokens);
    // console.log(this.labels);
  }
};

/*
* Interpreter
* Takes tokenizer output and tries to interpret it step by step
* TODO: at user defined rate.
*/
class Interpreter{

  constructor(){
    this.registers = new Registers(16);
    this.tokenizer = new Tokenizer();
    this.instrindex = 0;
  }

  run(){
    this.registers.emptyRegisters();
    this.tokenizer.tokenize();
    this.execute();
  }

  execute(){
    //Execute instructions with a 500 millisecond interval.
    var tokenStream = this.tokenizer.tokens;
    var interpreter = this;
    interpreter.instrindex = 0;

    var id = setInterval(function() {

      if(interpreter.instrindex === tokenStream.length){
          clearInterval(id);
          $("#execute-button").show(100);
      }

      if(interpreter.executeInstruction(tokenStream,interpreter) === -1){
        clearInterval(id);
        $("#execute-button").show(100);
      }
      interpreter.instrindex++;
    }, parseInt($("#points").val()));
  }

  executeInstruction(tokenStream,obj){
    var i = obj.instrindex;
    $("#instr").html(tokenStream[i]);
    if(tokenStream[i] != "HALT"){
      $("#operand").html(tokenStream[i+1]);
    }
    else{
      $("#operand").html("");
    }
    $("#info").html($("#"+tokenStream[i]).html());
    try{
      switch( tokenStream[i] ){
        case "LOAD":
          this.registers.content[0] = this.getValue(tokenStream[i+1]);
          obj.instrindex += 1;
          break;
        case "STORE":
          this.registers.content[ this.getValue(tokenStream[i+1],true) ] = this.registers.content[0];
          obj.instrindex += 1;
          break;
        case "ADD":
          this.registers.content[0] += this.getValue(tokenStream[i+1]);
          obj.instrindex += 1;
          break;
        case "SUB":
          this.registers.content[0] -= this.getValue(tokenStream[i+1]);
          obj.instrindex += 1;
          break;
        case "MULT":
          this.registers.content[0] *= this.getValue(tokenStream[i+1]);
          obj.instrindex += 1;
          break;
        case "DIV":
          this.registers.content[0] = Math.floor(this.registers.content[0] / this.getValue(tokenStream[i+1]));
          obj.instrindex += 1;
          break;
        case "WRITE":
          $("#output").html( this.getValue(tokenStream[i+1]) + "  " );
          obj.instrindex += 1;
          break;
        case "JUMP":
          obj.instrindex = this.findLabel(tokenStream[i+1]);
          break;
        case "JGTZ":
          if(this.registers.content[0] > 0){
            obj.instrindex = this.findLabel(tokenStream[i+1]);
          }
          else{
            obj.instrindex += 1
          }
          break;
        case "JZERO":
          if(this.registers.content[0] == 0){
            obj.instrindex = this.findLabel(tokenStream[i+1]);
          }
          else{
            obj.instrindex += 1;
          }
        case "READ":
          var read = NaN;
          while(true){
            read = prompt("Program is requesting an input number:", "");
            if(this.checkInt(read)) break;
          }
          this.registers.content[ this.getValue(tokenStream[i+1],true) ] = read;
          obj.instrindex += 1;
          break;
        case "HALT":
          return -1;
          break;
        default:
          throw "Unknown instruction" + "  '" + tokenStream[i] + "'" + ". Or program does not end on HALT";
          break;
      }
      this.registers.adjustTable();
    }
    catch(err){
      $("#output").html("<b style='color: red'>" + err + " </b>");
      return -1;
    }
  }

  //utility:
  checkInt(input){
    if(isNaN(input)) return false;
    var flt = parseFloat(input);
    return (flt | 0) === flt;
  }

  getValue(token, rawIndex){

    //invalid token case
    if(!token.length){ throw "Halted: token of length 0 received." }
    //indirect -> get value from pointed to register
    if(token[0] == "*" && this.checkInt(token.substr(1,token.length)) ){

      var regindex = parseInt( token.substr(1,token.length) );

      if(regindex >= 0 && regindex < this.registers.content.length){
        var pointer = this.registers.content[regindex];
        if( pointer == null){
           throw "Halted: Register used for indirect addressing contains no value.";
        }
        //Used for indirect storing only!
        if(rawIndex){
          if(pointer >= 0 && pointer < this.registers.content.length ){
            return pointer;
          }
          else{
            throw "Halted: Register index out of bounds.";
          }
        }

        var pointedVal = this.registers.content[pointer];

        if( pointedVal == null){
          throw "Halted: The register pointed to by the specified register contains no value.";
        }
        return pointedVal;
      }
      else{

        throw "Halted: Register index out of bounds.";
      }

    }
    //literal -> return literal validated token
    else if(token[0] == "=" && this.checkInt(token.substr(1,token.length)) ){
      return parseInt( token.substr(1,token.length) );
    }
    //register -> use whole token as register index.
    else if( this.checkInt(token) ){
      var regindex = parseInt(token);
      if( regindex >= 0 && regindex < this.registers.content.length){
        if(rawIndex){
          //rawindex is used for stores. In this case we do not want the content of reg x, but just x.
          return regindex;
        }
        else if( this.checkInt(this.registers.content[regindex]) ){
          return this.registers.content[regindex];
        }
        else{
          throw "Halted: Register contains no value."
        }
      }
      else{
        throw "Halted: Register index out of bounds.";
      }
    }
    //unrecognised -> halt
    else{
      throw "Halted: invalid operand received."
    }
  }

  findLabel(label){
    for(var i = 0; i < this.tokenizer.labels.length; i++){
      if(this.tokenizer.labels[i][0] == label){
        return (this.tokenizer.labels[i][1] - 1) //use -1 offset to compensate i++ of for loop.
      }
    }
    throw "Halted: Jump label " + label + " could not be found."
  }
}



$(function() {
  var interpreter = new Interpreter();

  $( "#register_amount_update" ).click(function() {
    var input = parseInt($("#register_amount").val());
    if( !isNaN(input) && input > 1 && input <= 64 ){
      interpreter.registers.adjustRegisters( input );
    }
    else{
      alert("Could not set registers. \nMake sure you entered a number between 2 and 64.")
    }
  });

  $( "#execute-button" ).click(function() {
    //console.log("Execution event");
    $("#execute-button").hide(100);
    interpreter.run();
  });

  $("#points").bind("propertychange change click keyup input paste", function(event){
    $("#speed").html( $("#points").val() );
  });
});
