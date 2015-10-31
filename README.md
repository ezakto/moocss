# moocss
Modular, Object-Oriented CSS

This is a small css preprocessor that lets you organize css in encapsulated modules. Built with [Rework](https://github.com/reworkcss/rework).

## Installation
```
npm install -g moocss
```

## Usage
```
moocss <source> [-o <destination>]
```

## Example

buttons.moo
```css
@module buttons;

.button {
    border: 1px solid #000;
    cursor: pointer;
}
```

colors.moo
```css
@module colors;

.red {
    background: #c00;
    color: #fff;
}

.green {
    background: #0c0;
    color: #000;
}
```

main.moo
```css
@import 'buttons.moo';
@import 'colors.moo';

input[type="submit"] extends .button from buttons {
    display: block;
}

.warning extends .red from colors {
    padding: 10px;
}
```

**result**
```css
.buttons .button,
input[type="submit"] {
  border: 1px solid #000;
  cursor: pointer;
}

.colors .red,
.warning {
  background: #c00;
  color: #fff;
}

.colors .green {
  background: #0c0;
  color: #000;
}

input[type="submit"] {
  display: block;
}

.warning {
  padding: 10px;
}
```