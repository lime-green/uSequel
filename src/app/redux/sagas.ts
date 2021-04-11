import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchUser(action: any) {
    yield put({ type: 'USER_FETCH_SUCCEEDED', text: 'hi' })
}

function* mySaga() {
    yield takeEvery('ADD_TODO', fetchUser)
}

export default mySaga
