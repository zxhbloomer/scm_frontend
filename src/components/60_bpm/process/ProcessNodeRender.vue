<template>
  <div ref="tip" class="process-node-render">
    <div :class="{'process-node-error': error}">
      <div style="font-size: 16px">
        <span v-if="task.enableEdit" style="color: red"> * </span>
        {{ task.title }}
      </div>
      <span v-if="task.users" style="color:#a8adaf;">{{ desc }}</span>
    </div>
    <div style="display:flex;">
      <avatar
        :closeable="user.enableEdit"
        :size="38"
        show-y
        :src="user.avatar"
        :type="user.type"
        :name="user.name"
        @close="delUser(i)"
        v-for="(user, i) in task.users"
        :key="'user_'+i"
      />
      <span v-if="task.enableEdit && (task.multiple || task.users.length === 0)" class="add-user" @click="$emit('addUser', task)">
        <i class="el-icon-plus" />
        <div>添加</div>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessNodeRender',
  components: {},
  props: {
    desc: {
      type: String,
      required: ''
    },
    task: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    error: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  methods: {
    delUser (i) {
      this.task.users.splice(i, 1)
      this.$emit('delUser', this.task.id, i)
    },
    errorShark () {
      this.$refs.tip.classList.add('shake-tip')
      setTimeout(() => this.$refs.tip.classList.remove('shake-tip'), 1200)
    }
  }
}
</script>

<style lang="less" scoped>
.process-node-error{
  color: @theme-danger;
}
.add-user {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  i {
    padding: 10px;
    font-size: 1.1rem;
    border-radius: 50%;
    border: 1px dashed #8c8c8c;
    cursor: pointer;

    &:hover {
      color: @theme-primary;
      border: 1px dashed @theme-primary;
    }
  }
}
.shake-tip {
  animation: shake 1s ease-in-out;
}
//水平抖动提示
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(+2px, 0, 0); }
  30%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(+4px, 0, 0); }
  50% { transform: translate3d(-4px, 0, 0); }
}

</style>
