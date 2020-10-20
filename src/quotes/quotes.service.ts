import { Injectable } from '@nestjs/common';

const quotes = [
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand - Martin Fowler",
  "First, solve the problem. Then, write the code - John Johnson",
  "Experience is the name everyone gives to their mistakes - Oscar Wilde",
  "In order to be irreplaceable, one must always be different - Coco Chanel",
  "Java is to JavaScript what car is to Carpet - Chris Heilmann",
  "Knowledge is power - Francis Bacon",
  "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday’s code - Dan Salomon",
  "Ruby is rubbish! PHP is phpantastic! - Nikita Popov",
  "Code is like humor. When you have to explain it, it’s bad - Cory House",
  "Fix the cause, not the symptom - Steve Maguire",
  "Optimism is an occupational hazard of programming: feedback is the treatment - Kent Beck",
  "When to use iterative development? You should use iterative development only on projects that you want to succeed - Martin Fowler",
  "Simplicity is the soul of efficiency - Austin Freeman",
  "Before software can be reusable it first has to be usable - Ralph Johnson",
  "Make it work, make it right, make it fast - Kent Beck",
  "It’s not a bug. It’s an undocumented feature!",
  "“Software Developer” - An organism that turns caffeine into software",
  "If debugging is the process of removing software bugs, then programming must be the process of putting them in - Edsger Dijkstra",
  "A user interface is like a joke. If you have to explain it, it’s not that good",
  "I don’t care if it works on your machine! We are not shipping your machine!” - Vidiu Platon",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight - Bill Gates",
  "I’m very font of you because you are just my type",
  "My code DOESN’T work, I have no idea why. My code WORKS, I have no idea why",
  "Things aren’t always #000000 and #FFFFFF",
  "One man’s crappy software is another man’s full time job - Jessica Gaston",
  "Programming is like sex. One mistake and you have to support it for the rest of your life - Michael Sinz",
  "Software undergoes beta testing shortly before it’s released. Beta is Latin for “still doesn’t work”",
  "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live - Martin Golding",
  "Talk is cheap. Show me the code - Linus Torvalds",
  "Old programmers never die. They simply give up their resources",
  "There are only two industries that refer to their customers as “users” - Edward Tufte",
  "Software is like sex: It’s better when it’s free - Linus Torvalds",
  "If at first you don’t succeed; call it version 1.0",
  "If Internet Explorer is brave enough to ask to be your default browser, You are brave enough to ask that girl out",
  "The best thing about a boolean is even if you are wrong, you are only off by a bit",
  "Without requirements or design, programming is the art of adding bugs to an empty text file - Louis Srygley",
  "Before software can be reusable it first has to be usable - Ralph Johnson",
  "The best method for accelerating a computer is the one that boosts it by 9.8 m/s2",
  "I think Microsoft named .Net so it wouldn’t show up in a Unix directory listing - Oktal",
  "There are two ways to write error-free programs; only the third one works - Alan J. Perlis",
  "Ready, fire, aim: the fast approach to software development. Ready, aim, aim, aim, aim: the slow approach to software development",
  "It’s not a bug - it’s an undocumented feature",
  "One man’s crappy software is another man’s full-time job - Jessica Gaston",
  "A good programmer is someone who always looks both ways before crossing a one-way street - Doug Linder",
  "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live - Martin Golding",
  "Programming is like sex. One mistake and you have to support it for the rest of your life - Michael Sinz",
  "Deleted code is debugged code - Jeff Sickel",
  "Walking on water and developing software from a specification are easy if both are frozen - Edward V Berard",
  "If debugging is the process of removing software bugs, then programming must be the process of putting them in - Edsger Dijkstra",
  "Software undergoes beta testing shortly before it’s released. Beta is Latin for “still doesn’t work",
  "There are only two kinds of programming languages: those people always bitch about and those nobody uses - Bjarne Stroustrup",
  "In order to understand recursion, one must first understand recursion",
  "The cheapest, fastest, and most reliable components are those that aren’t there - Gordon Bell",
  "The best performance improvement is the transition from the nonworking state to the working state - J. Osterhout",
  "The trouble with programmers is that you can never tell what a programmer is doing until it’s too late - Seymour Cray",
  "Don’t worry if it doesn’t work right. If everything did, you’d be out of a job - Mosher’s Law of Software Engineering"
];

@Injectable()
export class QuotesService {

  getRandomQuote(): string {
    return quotes[Math.floor(Math.random() * Math.floor(quotes.length))];
  }

}
