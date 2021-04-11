import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { Colors, Theme } from 'app/renderer/colors'

type Event = React.ChangeEvent<HTMLInputElement>
type ConnectionInputProps = {
    type: string
    name: string
    label: string
    onChange: (e: Event) => void
    value: string | number
    placeholder?: string
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
    }
`

const Button = styled.button`
    background-color: ${Colors.BLUE_PRIMARY};
    border: 0;
    border-radius: 5px;
    width: 100px;
    padding: 3px;
`

const ConnectionInput = ({
    type,
    name,
    label,
    onChange,
    value,
    placeholder,
}: ConnectionInputProps) => (
    <ConnectionInputRow>
        <Label htmlFor={name}>{label}</Label>
        <input
            onChange={onChange}
            value={value}
            type={type}
            name={name}
            placeholder={placeholder}
        />
    </ConnectionInputRow>
)

export const ConnectionScreen: FunctionComponent = () => {
    const state = useSelector((state) => state)
    const dispatch = useDispatch()
    const [name, setName] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [database, setDatabase] = React.useState('')
    const [port, setPort] = React.useState(3306)
    const onConnectionSubmit = (e: React.FormEvent) => {
        console.log('submitted!')
        e.preventDefault()
        dispatch({ type: 'ADD_TODO', text: 'hi' })
    }

    return (
        <ConnectionScreenWrapper>
            <ConnectionForm onSubmit={onConnectionSubmit}>
                <ConnectionInput
                    onChange={(e: Event) => setName(e.target.value)}
                    value={name}
                    type={'text'}
                    name={'name'}
                    label={'Name:'}
                />
                <ConnectionInput
                    onChange={(e: Event) => setUsername(e.target.value)}
                    value={username}
                    type={'text'}
                    name={'username'}
                    label={'Username:'}
                />
                <ConnectionInput
                    onChange={(e: Event) => setPassword(e.target.value)}
                    value={password}
                    type={'password'}
                    name={'password'}
                    label={'Password:'}
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
                <Button type={'submit'}>Connect</Button>
            </ConnectionForm>
        </ConnectionScreenWrapper>
    )
}
