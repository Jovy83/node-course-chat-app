const expect = require('expect');

const {generateMessage, generateLocationMessage} = require('./message');

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

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        const from = 'sender';
        const latitude = 10;
        const longitude = -90;
        const url = 'https://www.google.com/maps?q=10,-90';
        const result = generateLocationMessage(from, latitude, longitude);

        expect(result).toInclude({
            from,
            url
        });
        
        expect(result.createdAt).toBeA('number');
    });
});