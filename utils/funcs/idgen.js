async function idGen(type, n) {
    if (type === 'char') {
        return `${n}.${Date.now()}`;
    } 
}

module.exports = idGen;