import deals, {
    LOAD_DEALS
} from './deals'
describe('deals reducer', () => {
    it('should handle initial state', () => {
        expect(
            deals(undefined, {})
        ).toEqual([])
    })
    it('should handle LOAD_DEALS', () => {
        expect(
            deals([], {
                type: LOAD_DEALS,
                text: 'Run the tests',
                id: 0
            })
        ).toEqual([{
            text: 'Run the tests',
            completed: false,
            id: 0
        }])
        expect(
            deals([{
                text: 'Run the tests',
                completed: false,
                id: 0
            }], {
                type: 'LOAD_DEALS',
                text: 'Use Redux',
                id: 1
            })
        ).toEqual([{
            text: 'Run the tests',
            completed: false,
            id: 0
        }, {
            text: 'Use Redux',
            completed: false,
            id: 1
        }])
        expect(
            deals([{
                text: 'Run the tests',
                completed: false,
                id: 0
            }, {
                text: 'Use Redux',
                completed: false,
                id: 1
            }], {
                type: 'LOAD_DEALS',
                text: 'Fix the tests',
                id: 2
            })
        ).toEqual([{
            text: 'Run the tests',
            completed: false,
            id: 0
        }, {
            text: 'Use Redux',
            completed: false,
            id: 1
        }, {
            text: 'Fix the tests',
            completed: false,
            id: 2
        }])
    })
    it('should handle TOGGLE_TODO', () => {
        expect(
            deals([{
                text: 'Run the tests',
                completed: false,
                id: 1
            }, {
                text: 'Use Redux',
                completed: false,
                id: 0
            }], {
                type: 'TOGGLE_TODO',
                id: 1
            })
        ).toEqual([{
            text: 'Run the tests',
            completed: true,
            id: 1
        }, {
            text: 'Use Redux',
            completed: false,
            id: 0
        }])
    })
})
