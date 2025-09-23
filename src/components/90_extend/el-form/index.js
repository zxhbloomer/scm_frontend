import ExForm from './ExForm'

ExForm.install = (Vue, {
  form = 'ElForm'
} = {}) => {
  Vue.component(form || ExForm.name, ExForm)
}

export default ExForm
