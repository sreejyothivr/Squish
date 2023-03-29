/**********************************************************************
** Copyright (C) 2006 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**
** This file is part of Squish.
**
** Licensees holding a valid Squish License Agreement may use this
** file in accordance with the Squish License Agreement provided with
** the Software.
**
** This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
** WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
**
** See the LICENSE file in the toplevel directory of this package.
**
** Contact contact@froglogic.com if any conditions of this licensing are
** not clear to you.
**
**********************************************************************/

#ifndef TKEXTENSION_H
#define TKEXTENSION_H

#include <string.h>
#include <stdlib.h>
#include <tcl.h>

#if !defined(Q_PROPERTY) && !defined(SQUISH_NO_EXP_PROPS)
#define UNDEF_QPROPERTY
#define Q_PROPERTY(a)
#endif

#if defined(Q_OS_WIN32)
#  define strdup _strdup
#endif

// in tkpreload.cpp
extern "C" Tcl_Interp *squish_get_interpreter();

namespace Squish
{
    class TkExtension
    {
    public:
	TkExtension( const char *n ) { nm = strdup( n ); }
        ~TkExtension() { free( nm ); }

	const char *tclEvalString( char *code ) const;
	bool tclEvalBool( char *code ) const;
	int tclEvalNumber( char *code ) const;

        int lastTclResult() const { return res; }
	Tcl_Interp *interpreter() const { return squish_get_interpreter(); }

	const char *name() const { return nm; }

    private:
	char *nm;
	mutable int res;

    };


    inline const char *TkExtension::tclEvalString( char *code ) const
    {
	if ( !interpreter() || Tcl_InterpDeleted( interpreter() ) ) {
	    return 0;
	}

	res = Tcl_EvalEx( interpreter(), code, strlen( code ), TCL_EVAL_GLOBAL );

	return Tcl_GetStringResult( interpreter() );
    }

    inline bool TkExtension::tclEvalBool( char *code ) const
    {
	const char* s = tclEvalString( code );
	return s && (strcmp( s, "true" ) == 0 || strcmp( s, "1" ) == 0);
    }

    inline int TkExtension::tclEvalNumber( char *code ) const
    {
	const char* s = tclEvalString( code );
	return atoi( s );
    }
}

#endif
