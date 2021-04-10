import React, { FunctionComponent } from 'react'

type Event = React.ChangeEvent<HTMLInputElement>
type ConnectionInputProps = {
    type: string
    name: string
    label: string
    onChange: (e: Event) => void
    value: string | number | null
    placeholder?: string
}

const ConnectionInput = ({
    type,
    name,
    label,
    onChange,
    value,
    placeholder,
}: ConnectionInputProps) => (
    <div>
        <label>
            {label}
            <input
                onChange={onChange}
                value={value || ''}
                type={type}
                name={name}
                placeholder={placeholder}
            />
        </label>
    </div>
)

export const ConnectionScreen: FunctionComponent = () => {
    const [name, setName] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [database, setDatabase] = React.useState('')
    const [port, setPort] = React.useState(3306)
    const onConnectionSubmit = (e: React.FormEvent) => {
        console.log('submitted!')
        e.preventDefault()
    }

    return (
        <div>
            <form onSubmit={onConnectionSubmit}>
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

                <button type={'submit'}>Connect</button>
            </form>
        </div>
    )
}
