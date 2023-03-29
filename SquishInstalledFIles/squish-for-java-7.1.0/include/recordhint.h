/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
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

#ifndef SQUISH_RECORDHINT_H
#define SQUISH_RECORDHINT_H

#include <list>
#include <qevent.h>

#if QT_VERSION < 0x040000
#include <qapplication.h>
#else
#include <qcoreapplication.h>
#endif

namespace Squish
{
    class RecordHintArgument
    {
    public:
	enum DataType {
	    IntArg,
	    BoolArg,
	    StringArg,
	    QObjectArg,
	    DoubleArg
	};

	RecordHintArgument()
	    : dt( IntArg ), v(), o( 0 ) { d = 0; } // assign to 'd' to suppress warnings about unused variables
	RecordHintArgument( DataType t, const QString &value )
	    : dt( t ), v( value ), o( 0 ) {}
	RecordHintArgument( const QString &value )
	    : dt( StringArg ), v( value ), o( 0 ) {}
	RecordHintArgument( const char *value )
	    : dt( StringArg ), v( QString::fromLocal8Bit( value ) ), o( 0 ) {}
	RecordHintArgument( int value )
	    : dt( IntArg ), v( QString::number( value ) ), o( 0 ) {}
	RecordHintArgument( double value )
	    : dt( DoubleArg ), v( QString::number( value ) ), o( 0 ) {}
	RecordHintArgument( bool value )
	    : dt( BoolArg ), v( value ? "True" : "False" ), o( 0 ) {}
	RecordHintArgument( QObject *obj )
	    : dt( QObjectArg ), v(), o( obj ) {}

	DataType dataType() const { return dt; }
	QString value() const { return v; }
	QObject *object() const { return o; }

    private:
	DataType dt;
	QString v;
	QObject *o;
	void *d;

    };

    typedef std::list<RecordHintArgument> RecordHintArgumentList;

    class RecordHint
    {
    public:
	enum Type {
	    Comment,
	    Function,
            SetEventCompression
	};

	enum InsertionMode {
	    BeforeCommand,
	    AfterCommand,
	    OverwriteCommand
	};

	RecordHint() {}

	RecordHint( Type t, const QString &commentOrFunc = QString() )
	    : typ( t ), cof( commentOrFunc ), insMod( AfterCommand ) {}

	void addArgument( const RecordHintArgument &a ) {
	    args.push_back( a );
	}
	void addArgument( const QString &v ) {
	    args.push_back( RecordHintArgument( v ) );
	}
	void addArgument( const char *v ) {
	    args.push_back( RecordHintArgument( v ) );
	}
	void addArgument( int v ) {
	    args.push_back( RecordHintArgument( v ) );
	}
	void addArgument( bool v ) {
	    args.push_back( RecordHintArgument( v ) );
	}
	void addArgument( double v ) {
	    args.push_back( RecordHintArgument( v ) );
	}
	void addArgument( QObject *v ) {
	    args.push_back( RecordHintArgument( v ) );
	}

	Type type() const { return typ; }
	QString commentOrFunction() const { return cof; }
	RecordHintArgumentList recordHintArguments() const { return args; }

    void send(InsertionMode i = AfterCommand , bool immediate = false );

	InsertionMode insertionMode() const { return insMod; }

    private:
	Type typ;
	QString cof;
	RecordHintArgumentList args;
	InsertionMode insMod;

    };

    class RecordHintList
    {
    public:
	RecordHintList() {}

	void addRecordHint( const RecordHint &rh ) {
	    l.push_back( rh );
	}

	void send( RecordHint::InsertionMode i = RecordHint::AfterCommand ) {
        for ( std::list<RecordHint>::iterator it = l.begin(); it != l.end(); ++it ) {
            (*it).send( i );
        }
	}

    private:
        std::list<RecordHint> l;

    };

    class RecordHintEvent : public QEvent
    {
    public:
	enum {
	    Id = QEvent::User + 8002
	};

	RecordHintEvent( const RecordHint &recordHint )
	    : QEvent( QEvent::Type( Id ) ),
	    hint( recordHint )
	{
	    d = 0; // assign to 'd' to suppress warnings about unused variables
	}

	const RecordHint &recordHint() const { return hint; }

    private:
	RecordHint hint;
	void *d;

    };

    inline void RecordHint::send( InsertionMode i, bool immediate )
    {
	insMod = i;
    if ( immediate ) {
        RecordHintEvent ev( *this );
#if QT_VERSION < 0x040000
        QApplication::sendEvent( qApp, &ev );
#else
        QCoreApplication::sendEvent( QCoreApplication::instance(), &ev );
#endif
    } else {
#if QT_VERSION < 0x040000
        QApplication::postEvent( qApp, new RecordHintEvent( *this ) );
#else
        QCoreApplication::postEvent( QCoreApplication::instance(), new RecordHintEvent( *this ) );
#endif
    }
    }
}

#endif
