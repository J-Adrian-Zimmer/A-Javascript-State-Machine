# A-Javascript-State-Machine

This repository contains the code described in the ebook "A Javascript State Machine" by J Adrian Zimmer.  The book is currently available for free on Amazon.  

Here is the preface:

"A Javascript State Machine" explains how to implement a state machine that is consistent with Javascript's style of asynchronous programming.
Such a state machine is not like those you saw in  theoretical computer science classes.  In this version the states are functions that process input and then choose the next state function to execute.

Designing a state machine is a way of dividing your program into chunks whose relationship with each other is easily diagrammed.

Programming for the Javascript event loop works best when your program is divided into chunks.  The state machine approach fits will with the Javascript way of doing things.   A process that follows a state machine pattern can play nicely with other activities when the states are implemented as functions.  The functions can then be placed on an event queue to wait their turn in a complete application that combines multiple state machines with the usual Javascript event handlers.

Long running processes in particular benefit from state machine design as the design can be used to keep them from monopolizing the interpreter's time.   

The particular state machine shown here is simple but not trivial.  The problem it solves is not so important.  Rather it merely serves as a starting point for your thinking about your own state machines.  This starting point is a program that converts records of stock purchases and sales into transactions that match shares bought with shares sold.  Matching is done in a FIFO manner.

Readers should be familiar with Javascript and Nodejs.  Readers who have had an unfortunate previous experience with theoretical state machines will be at a slight disadvantage but the trauma will fade away.

Other ebooks by J Adrian Zimmer:


1. [From Simple IO to IO Monads](https://www.amazon.com/Simple-IO-Monad-Transformers-ebook/dp/B00KN6XZ1M/) which explains a tricky
part of Haskell with a series of examples and a few worked exercises.

2. [Javascript Promises Clarified](https://www.amazon.com/Javascript-Promises-Clarified-Adrian-Zimmer-ebook/dp/B01MZ6WYHJ/) which explains promises
using two examples which, like the example in this ebook, are neither trivial nor overly complex.  One of the examples contrasts promises with webworkers.

3. [Git Overview](https://www.amazon.com/Git-Overview-Incantations-Adrian-Zimmer-ebook/dp/B01GLSD1JG/) which is an overview that goes into some detail about how repos
are represented and how branches are merged or rebased.  The overview is followed with over 75 examples of particular Git statements.

