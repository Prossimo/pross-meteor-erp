import InputField from './InputField'
import SelectField from './SelectField'
import SelectWithAddField from './SelectWithAddField'
import DateField from './DateField'

const getComponent = (type) => {
    let cmp
    switch (type) {
        case 'date':
            {
                cmp = DateField
                break
            }
        case 'select':
            {
                cmp = SelectField
                break
            }
        case 'selectWithAdd':
            {
                cmp = SelectWithAddField
                break
            }
        default:
            {
                cmp = InputField
            }
    }
    return cmp
}

export default getComponent
