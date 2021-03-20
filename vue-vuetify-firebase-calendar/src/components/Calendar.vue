<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
          flat
        >
          <v-btn
            outlined
            class="mr-4"
            color="primary"
            @click="dialog = true"
          >
            New Event
          </v-btn>
          <v-btn
            outlined
            class="mr-4"
            color="grey darken-2"
            @click="setToday"
          >
            Today
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu
            bottom
            right
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

        <!--Add Event dialog-->
        <v-dialog v-model="dialog" max-width="500">
            <v-card>
                <v-container>
                    <v-form @submit.prevent="addEvent">
                        <v-text-field v-model="name" type="text" label="event name (require)"></v-text-field>
                        <v-text-field v-model="details" type="text" label="detail"></v-text-field>
                        <v-text-field v-model="start" type="date" label="start (require)"></v-text-field>
                        <v-text-field v-model="end" type="date" label="end (require)"></v-text-field>
                        <v-text-field v-model="color" type="color" label="color"></v-text-field>
                        <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog=false">
                            Create Event
                        </v-btn>
                    </v-form>
                </v-container>
            </v-card>
        </v-dialog>


      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="setDialogDate"
          @change="updateRange"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn icon>
                <v-icon @click="deleteEvent(selectedEvent.id)">mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
                <form v-if="currentlyEditing !== selectedEvent.id">
                    {{selectedEvent.details}}
                </form>
                <form v-else>
                    <textarea-autosize
                        v-model="selectedEvent.details"
                        type="text"
                        style="width:100%"
                        :min-height="100"
                        placeholder="add note"
                    ></textarea-autosize>
                </form>
              <!-- <span v-html="selectedEvent.details"></span> -->
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                close
              </v-btn>
              <v-btn
                text
                v-if="currentlyEditing !== selectedEvent.id"
                @click.prevent="editEvent(selectedEvent)"
              >
                Edit
              </v-btn>
              <v-btn
                text
                v-else
                @click.prevent="updateEvent(selectedEvent)"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import{db} from '@/main';

export default{
    data:() =>({
        focus: new Date().toISOString().substr(0,10),
        type:"month",
        typeToLabel:{
            month:"Month",
            week:"Week",
            day:"Day",
            "4day": "4 Days",
        },
        Name: null,
        Details:null,
        start:null,
        end:null,
        color:"#1976D2",
        currentlyEditing: null,
        selectedEvent:{},
        selectedElement: null,
        selectedOpen: false,
        events: [],
        dialog: false,

    }),

    mounted(){
        this.getEvents();
    },

    methods:{
        async getEvents(){
            let snapshot = await db.collection('calEvent').get();
            let events = [];
            snapshot.forEach(doc => {
                let appData = doc.data(); //這邊包含在firebase裡打的內容，但是id是在data外層
                appData.id = doc.id;  // id是在doc裡，和data同層，所以另外用這個方式把它取出來
                // events.push({
                //     name: appData.Name,
                //     start: appData.start,
                //     end:appData.end,
                //     color:appData.color,
                //     details:appData.Details,
                // });
                events.push(appData);  //依照上面的方法，可以顯示建程式前，在資料庫建好的資料，但是之後建的資料內容看不到；而這行的結果剛好相反
            });
            this.events = events;
        },

        async addEvent(){
            if(this.name && this.start && this.end){
                await db.collection('calEvent').add({
                    name: this.name,
                    details: this.details,
                    start: this.start,
                    end: this.end,
                    color: this.color
                });
                this.getEvents();
                     this.name="",
                     this.details="",
                     this.start="",
                     this.end="",
                     this.color=""
            }else{
                alert('請填入欲新增事件名稱、開始時間及結束時間');
            }
        },

        async updateEvent(event){
            await db.collection('calEvent').doc(this.currentlyEditing).update({
                details: event.details
            });
            this.selectedOpen = false;
            this.currentlyEditing = null;
        },

        async deleteEvent(event){
            await db.collection('calEvent').doc(event).delete();
            this.selectedOpen = false;
            this.getEvents();
        }, 

        editEvent(event){
            this.currentlyEditing = event.id;
            
        },


         setDialogDate( { date }) {
      this.dialogDate = true
      this.focus = date
    },
         viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = ''
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },


      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => {
            this.selectedOpen = true
          }, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
    
       updateRange ({ start, end }) {
      this.start = start
      this.end = end
    },
    nth (d) {
      return d > 3 && d < 21
      ? 'th'
      : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
    }

    },
};
</script>