module.exports = {
    handleMongooseError: (err) => {
        let firstKey = Object.keys(err.errors)[0]
        return err.errors[firstKey].message
    }
}