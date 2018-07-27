import styled from 'styled-components'
import Panel from './Panel'
import Navbar from './Navbar'
import Container from './Container'

Panel.HeadingNavbar = styled(Panel.Heading, {})`
    padding: 0
    ${Navbar} {
        margin-bottom: 0;
        border: none;
        padding: 0 15px;
    }
`

export {
    Container,
    Panel,
    Navbar
}
