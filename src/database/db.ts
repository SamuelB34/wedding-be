import mongoose from 'mongoose';

const DB_URI = 'mongodb://localhost:27017/'

const connect = (): void => {
    const connect = (): void => {
        mongoose.connect(
            DB_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as mongoose.ConnectOptions,
        )
        const db = mongoose.connection;

        db.on('error', () => console.log('Connection error 💥💥💥'));
        db.once('open', function () {
            console.log('Connected to the database! ✅✅✅');
        });

    };

    connect()
}

export default { connect };