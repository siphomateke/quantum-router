<template>
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">Message</p>
  </header>
  <section class="modal-card-body">
    <b-field label="Recipients:">
      <b-taginput
        v-model="numbers"
        icon="phone"
        placeholder="Add a number">
      </b-taginput>
    </b-field>
    <b-field label="Content">
      <b-input type="textarea" v-model="content"></b-input>
    </b-field>
  </section>
  <footer class="modal-card-foot">
    <button class="button is-primary" @click="send">Send</button>
    <button class="button" @click="save">Save as draft</button>
    <button class="button" @click="cancel">Cancel</button>
  </footer>
</div>
</template>

<script>
export default {
  name: 'sms-dialog',
  data() {
    return {
      numbers: [],
      content: '',
    };
  },
  methods: {
    send() {
      this.$emit('send', this.numbers, this.content);
    },
    save() {
      this.$emit('save', this.numbers, this.content);
    },
    cancel() {
      this.$parent.close();
    },
  },
};
</script>
