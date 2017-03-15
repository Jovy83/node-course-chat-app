const expect = require('expect');

const {generateMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate the correct message object', () => { // no need for done because this is not an async function

        const from = 'sender';
        const text = 'test text';
        const result = generateMessage(from, text)
        expect(result).toInclude({
            from, 
            text
        });
        expect(result.createdAt).toBeA('number');
    });
});