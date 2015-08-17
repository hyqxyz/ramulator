# ramulator
Ramulator is a javascript implementation of a simple random access machine.

You can test out the machine and an example program at:

http://hyqxyz.github.io/ramulator/ (requires ECMAScript 2015 (ES6) enabled browser)

# Operands

<table>

  <tr>
    <td><b>i</b></td>
    <td>Content of register i</td>
  </tr>

  <tr>
    <td><b>*i</b></td>
    <td>Indirect adressing. If register i contains the number j, the operand will be the number contained in register j </td>
  </tr>

  <tr>
    <td><b>=i</b></td>
    <td>literal, e.g "LOAD =1" loads the number 1 in R0</td>
  </tr>

  <tr>
    <td><b>b</b></td>
    <td>A label, used for jumps</td>
  </tr>

</table>
# Instructions
<table>
    <tr>
      <td>Instruction</td>
      <td>Info</td>
      <td>advised modes</td>
      </tr>
    <tr>
      <td>LOAD</td>
      <td id="LOAD">Loads a value to R0</td>
      <td>i , *i , =i</td>
    </tr>

    <tr>
      <td>STORE</td>
      <td id="STORE">Stores R0 in the register specified as the operand</td>
      <td>i , *i</td>
    </tr>

    <tr>
      <td>ADD</td>
      <td id="ADD">Adds the operand value to R0 and stores it in R0</td>
      <td>i , *i , =i</td>
    </tr>

    <tr>
      <td>SUB</td>
      <td id="SUB">Subtracts the operand value from R0 and stores it in R0</td>
      <td>i , *i , =i</td>
    </tr>

    <tr>
      <td>MULT</td>
      <td id="MULT">Multiplies the operand value with R0 and stores it in R0</td>
      <td>i , *i, =i</td>
    </tr>

    <tr>
      <td>DIV</td>
      <td id="DIV">Divides R0 by the operand value, rounds down to an integer and stores it in R0</td>
      <td>i , *i, =i</td>
    </tr>

    <tr>
      <td>READ</td>
      <td id="READ">Reads in a value and stores it in the register specified as operand</td>
      <td>i , *i</td>
    </tr>

    <tr>
      <td>WRITE</td>
      <td id="WRITE">Writes the operand value to the output box</td>
      <td>i , *i , =i</td>
    </tr>

    <tr>
      <td>JUMP</td>
      <td id="JUMP">Jumps unconditionally to the label specified as operand</td>
      <td>b</td>
    </tr>

    <tr>
      <td>JGTZ</td>
      <td id="JGTZ">Jumps to the label specified as operand if R0 > 0</td>
      <td>b</td>
    </tr>

    <tr>
      <td>JZERO</td>
      <td id="JZERO">Jumps to the label specified as operand if R0 == 0</td>
      <td>b</td>
    </tr>

    <tr>
      <td>HALT</td>
      <td id="HALT">Used to mark the end of the program</td>
      <td>None</td>
    </tr>

</table>


