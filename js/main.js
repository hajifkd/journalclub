'use strict';

function escapeHtml(content) {
  var TABLE_FOR_ESCAPE_HTML = {
    "&": "&amp;",
    "\"": "&quot;",
    "<": "&lt;",
    ">": "&gt;"
  };
  return content.replace(/[&"<>]/g, function(match) {
    return TABLE_FOR_ESCAPE_HTML[match];
  });
}

function newTalk() {
  return {
    title: '',
    abstract: '',
    date: new Date(),
    name: '',
  };
}

$(() => {
  Vue.filter('newline', value => value ? escapeHtml(value).replace(/\n/g, "<br />") : '');
  
  Vue.component('edit-dialog', {
    template: '#edit-dialog',
    props: {
      show: Boolean,
      finish: Function,
      talk: Object,
      title: {
        type: String,
        default: "Editing...",
      },
      date: {
        type: String,
        default: new Date().toISOString().substring(0, 10)
      }
    },
    created() {
      this.$watch('talk', value => { 
        this.date = value.date.toISOString().substring(0, 10);
      });
    },
    components: {
      modal: VueStrap.modal,
      datepicker: VueStrap.datepicker,
    },
    methods: {
      preFinish() {
        this.talk.date = new Date(this.date + ' 10:30:00');
        this.finish();
      }
    }
  });
  
  let talkView = Vue.extend({
    template: "#talk-view",
    data() {
      return {
        showModal: false,
        eTalk: newTalk(),
      };
    },
    props: {
      talk: Object,
    },
    methods: {
      fail() {
        
      },
      edit() {
        this.eTalk = JSON.parse(JSON.stringify(this.talk));
        this.eTalk.date = new Date(this.eTalk.date);
        this.showModal = true;
      },
      finishEditing() {
        console.log(this.eTalk);
        $.ajax({
          type: 'POST',
          url: '/hajime.fukuda/bar/edittalk',
          contentType: 'application/json',
          dataType : 'JSON',
          data: JSON.stringify(this.eTalk)
        }).then(
          status => {
            if (!status.success) {
              this.fail();
              return;
            }
            
            for (let key in this.eTalk) {
              this.talk[key] = this.eTalk[key];
            }
            
            this.showModal = false;
          },
          this.fail
        );
      }
    }
  });
  
  let talks = new Vue({
    el: '#talks',
    data: {
      adding: false,
      futureOnly: false,
      talks: [],
      editingTalk: newTalk(),
    },
    created() {
      $.getJSON('http://member.ipmu.jp/hajime.fukuda/bar/talks').then(
        data => {
          if (!data.success) return;
          for (let talk of data.talks) {
            talk.date = new Date(talk.date);
          }
          this.talks = data.talks.sort((a, b) => b.date - a.date);
        }
      )
    },
    components: {
      'talk-view': talkView
    },
    methods: {
      fail() {
        
      },
      finishEditing() {
        $.ajax({
          type: 'POST',
          url: '/hajime.fukuda/bar/edittalk',
          contentType: 'application/json',
          dataType : 'JSON',
          data: JSON.stringify(this.editingTalk)
        }).then(
          status => {
            if (!status.success) {
              this.fail();
              return;
            }
            
            this.talks.unshift(this.editingTalk);
            this.editingTalk = newTalk();
          },
          this.fail
        );
      },
      hoge() {
        console.log(this);
        this.adding = true;
      },
    }
  });
  
  let speakers = new Vue({
    el: '#speakers',
    data: {
      speakers: []
    },
    created() {
      $.getJSON('http://member.ipmu.jp/hajime.fukuda/bar/users').then(
        data => {
          if (!data.success) return;
          this.speakers = data.users;
        }
      )
    }
  });
});