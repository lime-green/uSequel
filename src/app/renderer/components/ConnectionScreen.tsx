import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { Colors, Theme } from 'app/renderer/colors'
import { connectionSlice, selectCurrentTabId } from 'app/redux'

type Event = React.ChangeEvent<HTMLInputElement>
type ConnectionInputProps = {
    type: string
    name: string
    label: string
    onChange: (e: Event) => void
    value: string | number
    placeholder?: string
    required?: boolean
}

const ConnectionScreenWrapper = styled.div`
    background-color: ${Theme.BG};
`

const ConnectionForm = styled.form`
    padding: 10px;
    background-color: ${Theme.BG_SECONDARY};
    border-radius: 5px;
    border: 1px solid ${Colors.STEEL_GREY};
`

const Label = styled.label`
    width: 100px;
    text-align: right;
    display: block;
`

const ConnectionInputRow = styled.div`
    display: flex;
    padding: 5px;

    input {
        margin-left: 8px;
        border-radius: 1px;
        border: 1px solid ${Colors.STEEL_GREY};
    }
`

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 10px;
`

const Button = styled.button`
    background-color: ${Colors.BLUE_PRIMARY};
    border: 0;
    border-radius: 5px;
    width: 90%;
    padding: 3px;

    &:hover {
        cursor: pointer;
    }
`

const ConnectionInput = ({ name, label, ...props }: ConnectionInputProps) => (
    <ConnectionInputRow>
        <Label htmlFor={name}>{label}</Label>
        <input {...props} name={name} />
    </ConnectionInputRow>
)

export const ConnectionScreen: FunctionComponent = () => {
    const dispatch = useDispatch()
    const currentTabId = useSelector(selectCurrentTabId)
    const [host, setHost] = React.useState('localhost')
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [database, setDatabase] = React.useState('')
    const [port, setPort] = React.useState(3306)
    const onConnectionSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        dispatch(
            connectionSlice.actions.attemptConnection(
                currentTabId,
                'placeholder-name',
                host,
                username,
                password,
                database,
                port,
            ),
        )
    }

    return (
        <ConnectionScreenWrapper>
            <ConnectionForm onSubmit={onConnectionSubmit}>
                <ConnectionInput
                    onChange={(e: Event) => setHost(e.target.value)}
                    value={host}
                    type={'text'}
                    name={'host'}
                    label={'Host:'}
                    required={true}
                />
                <ConnectionInput
                    onChange={(e: Event) => setUsername(e.target.value)}
                    value={username}
                    type={'text'}
                    name={'username'}
                    label={'Username:'}
                    required={true}
                />
                <ConnectionInput
                    onChange={(e: Event) => setPassword(e.target.value)}
                    value={password}
                    type={'password'}
                    name={'password'}
                    label={'Password:'}
                    required={true}
                />
                <ConnectionInput
                    onChange={(e: Event) => setDatabase(e.target.value)}
                    value={database}
                    type={'text'}
                    name={'database'}
                    label={'Database:'}
                    placeholder={'optional'}
                />
                <ConnectionInput
                    onChange={(e: Event) => setPort(Number(e.target.value))}
                    value={port}
                    type={'number'}
                    name={'port'}
                    label={'Port:'}
                />
                <ButtonWrapper>
                    <Button type={'submit'}>Connect</Button>
                </ButtonWrapper>
            </ConnectionForm>
        </ConnectionScreenWrapper>
    )
}
