import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';

declare var $: any;
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'VoiceSecured';
  private recognition: SpeechRecognition;
  public noteTextarea = '';
  public instructions = 'Press the Start Recognition button and allow access.';
  private currentLine = '';
  private noteContent = '';
  public notesList: any[] = [];
  private speechSynthesis: SpeechSynthesis;
  private utterInstances: SpeechSynthesisUtterance;
  public speechCustom: string;
  public suffix = '';
  public listenAfterSpeechSwitch = true;
  private readonly fillerSpeechList: string [] = [
    'now, now don\'t be hasty',
    'Please hold on, I need your help',
    'Do you trust me?',
    'I have faith in you, can you take a leap of faith on me',
    'Well that is just plain rude',
    'Jimmy The Cricket your a quick one!',
    'Thanks, that is sure nice of you to say',
    'Did you get that on sale its so cute',
    'Oh rusty buckets, you\'re going to catch a fever out there',
    'The quickest Ostrich gets the egg, but the chicken mothers them'
  ];
  public filler = '';
  private isFemale: boolean = true;

  constructor(private cdRef: ChangeDetectorRef) {
  }


  ngOnInit()  {
    const { webkitSpeechRecognition }: IWindow = window  as IWindow;
    this.speechSynthesis =  (window as any ).speechSynthesis;
    this.utterInstances = new SpeechSynthesisUtterance();
    this.utterInstances.onend = (event) => {
      console.log('I stopped speaking.. starting listening');
      if (this.listenAfterSpeechSwitch) {
        this.recognition.start();
      }
    };
    this.utterInstances.onstart = (event) => {
      console.log('I started speaking');
    };




    // this.speechRecognition = SpeechRecognition;
    try {
      this.recognition = new webkitSpeechRecognition();
    } catch (e) {
      console.error(e);
    }
    const notes = this.getAllNotes();
    // this.renderNotes(notes);
    /*-----------------------------
      Voice Recognition
------------------------------*/

    // If false, the recording will stop after a few seconds of silence.
    // When true, the silence period is longer (about 15 seconds),
    // allowing us to keep recording even when the user pauses.
    this.recognition.continuous = false;

    // This block is called every time the Speech APi captures a line.


    this.recognition.onresult = (event: SpeechRecognitionEvent  ) => {

      // event is a SpeechRecognitionEvent object.
      // It holds all the lines we have captured so far.
      // We only need the current one.
      const current = event.resultIndex;
      console.log(event.results);

      // Get a transcript of what was said.
      const transcript = event.results[current][0].transcript;
      this.currentLine = transcript;
      console.log('This is the transcript: ' + transcript);
      console.log('This is the event result ' + event.results);

      const wordList = this.currentLine.split(' ');
      let scramberList =  [];
      let tempSuffix = this.suffix;
      for ( let i = 0; i < wordList.length; i++) {
        if (i % 2 === 0) {
          scramberList.push(wordList[i] + tempSuffix);
        } else {
          scramberList.push(wordList[i]);
        }

      }

      let scrambledStr = scramberList.join(' ');

      // setTimeout(() => {
      //   this.readOutLoud(scrambledStr, false);
      // }, 1600 );


      // Add the current transcript to the contents of our Note.
      // There is a weird bug on mobile, where everything is repeated twice.
      // There is no official solution so far so we have to handle an edge case.
      const mobileRepeatBug = (current === 1 && transcript === event.results[0][0].transcript);
      this.currentLine =  transcript;
      if (!mobileRepeatBug) {
        this.noteContent += ' '  + transcript;
        this.noteTextarea = this.noteContent;
        this.cdRef.detectChanges();
      }

    };

    this.recognition.onstart = () => {
      this.instructions = 'Voice recognition activated. Try speaking into the microphone.';
    };

    this.recognition.onspeechend = (event) => {
      console.log(event);
      this.instructions = 'You were quiet for a while so voice recognition turned itself off.';
      this.cdRef.detectChanges();
      this.recognition.stop();
      console.log('I stopped listening');

      // setTimeout(()=>{
      //   this.recognition.start();
      // },2000)


    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        this.instructions = 'No speech was detected. Try again.';
      }
    };


    console.log(this.speechSynthesis);

  }

  ngAfterViewInit(): void {
  }

  startRecord(event: any) {
    console.log('look hello');
    if (this.noteContent.length) {
      this.noteContent += ' ';
    }
    this.cdRef.detectChanges();
    this.recognition.start();
  }
  pauseRecord(event: any) {
    this.recognition.stop();
    this.instructions = 'Voice recognition paused.';
    this.cdRef.detectChanges();
  }
  saveRecord(event: any) {
    this.recognition.stop();

    if (!this.noteContent.length) {
      this.instructions = 'Could not save empty note. Please add a message to your note.';
    } else {
      this.saveNote(new Date().toLocaleString(), this.noteContent);
      this.noteContent = '';

    }
    this.cdRef.detectChanges();
  }

  saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
  }

  onTextGen(event) {
    this.recognition.stop();
    this.readOutLoud(event, false);
  }


  getAllNotes() {
    const notes = [];
    let key;
    for (let i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);

      if (key.substring(0, 5) === 'note-') {
        notes.push({
          date: key.replace('note-', ''),
          content: localStorage.getItem(localStorage.key(i))
        });
      }
    }
    return notes;
  }
  speakFromText(event): void {
    this.recognition.stop();
    this.readOutLoud(this.speechCustom, true);
  }

  readOutLoud(message: string, selfInitiated: boolean): any {
    // Set the text and voice attributes.
    // tslint:disable-next-line:no-unused-expression
    this.utterInstances.voice = this.isFemale ? this.speechSynthesis.getVoices()[4] : this.speechSynthesis.getVoices()[5];
    this.utterInstances.text = message;
    this.utterInstances.volume = 1;
    this.utterInstances.rate = 0.7;
    this.utterInstances.pitch = 0.8;

    return this.speechSynthesis.speak(this.utterInstances);
  }
  generateFillerSpeech(event): void {
    const len: number = this.fillerSpeechList.length;
    const index: number = Math.floor(Math.random() * len);

    this.utterInstances.voice =  this.speechSynthesis.getVoices()[5];
    this.filler =  this.fillerSpeechList[index];
    this.utterInstances.text = this.filler;
    this.utterInstances.volume = 1;
    this.utterInstances.rate = 0.7;
    this.utterInstances.pitch = 0.8;
    return this.speechSynthesis.speak(this.utterInstances);
  }



}
